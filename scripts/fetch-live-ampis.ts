import { parseAmpisHtml } from "../src/lib/ingestion/parsers/ampis-parser";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import NepaliDate from "nepali-date-converter";
import { eq, and, sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sqlClient = neon(dbUrl);
const db = drizzle(sqlClient, { schema });

// The exact government market IDs discovered from our live form inspection on ampis.gov.np
export const AMPIS_MARKET_IDS: Record<string, string> = {
  kalimati: "23",
  birtamod: "5",
  dharan: "6",
  dhalkebar: "7",
  kamalamai: "8",
  kawasoti: "9",
  pokhara: "10",
  butwal: "11",
  kohalpur: "12",
  birendranagar: "13",
  attariya: "14",
  lalbandi: "15",
};

// Known entity IDs for Bikram Sambat years in Drupal Views
const AMPIS_YEAR_IDS: Record<number, string> = {
  2080: "16",
  2081: "446538",
  2082: "894719",
  2083: "1614822",
};

async function resolveAmpisYearId(bsYear: number): Promise<string> {
  if (AMPIS_YEAR_IDS[bsYear]) return AMPIS_YEAR_IDS[bsYear];
  try {
    const res = await fetch("https://ampis.gov.np", { signal: AbortSignal.timeout(10000) });
    const html = await res.text();
    const $ = cheerio.load(html);
    let found = "";
    $('select[name="field_market_rate_year_target_id_entityreference_filter"] option').each((_, opt) => {
      if ($(opt).text().trim() === String(bsYear)) {
        found = $(opt).attr("value") || "";
      }
    });
    if (found) return found;
  } catch {}
  return "1614822"; // default fallback for 2083
}

async function fetchLiveMarket(
  marketSlug: string,
  ampisId: string,
  yearId: string,
  monthId: string,
  bsDay: number
) {
  const targetUrl = `https://ampis.gov.np/market-price-comparison?uid_entityreference_filter=${ampisId}&field_market_rate_commodity_target_id_entityreference_filter=All&field_market_rate_year_target_id_entityreference_filter=${yearId}&field_market_rate_month_target_id=${monthId}&field_market_rate_day_target_id=${bsDay}`;

  console.log(`🌐 [Live Ingest] Fetching ${marketSlug.toUpperCase()} (AMPIS ID: ${ampisId}) for Day: ${bsDay}...`);

  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    console.log(`  ⚠ Server returned HTTP ${response.status} for ${marketSlug}`);
    return [];
  }

  const html = await response.text();
  const parsedRows = parseAmpisHtml(html);
  return parsedRows;
}

export async function runLiveIngestion() {
  console.log("🚀 Starting Real-Time AMPIS Ingestion for All Federal Markets...\n");

  const allCommodities = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allCommodities.map((c) => [c.nameNe.trim(), c.id]));

  const allMarkets = await db.select().from(schema.markets);
  const marketSlugMap = new Map(allMarkets.map((m) => [m.publicSlug, m.id]));

  const firstObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = firstObs[0]?.id || 1;

  const today = new Date();
  const dateAdStr = today.toISOString().split("T")[0];
  const bsDate = new NepaliDate(today);
  const bsYear = bsDate.getYear();
  const bsMonth = bsDate.getMonth() + 1; // 1 to 12
  const bsDay = bsDate.getDate();

  // Drupal month IDs: Month 1 (Baisakh) = 33, Month 6 (Ashoj) = 38, Month 12 (Chaitra) = 44
  const ampisMonthId = String(32 + bsMonth);
  const ampisYearId = await resolveAmpisYearId(bsYear);

  console.log(`📅 Target Date: AD ${dateAdStr} | BS ${bsYear}-${bsMonth}-${bsDay} (AMPIS Year: ${ampisYearId}, Month: ${ampisMonthId}, Day: ${bsDay})\n`);

  // Ordered market ingestion list: Kalimati first, then all 11 regional hubs
  const marketQueue = [
    "kalimati",
    "pokhara",
    "birtamod",
    "dharan",
    "butwal",
    "dhalkebar",
    "kamalamai",
    "kawasoti",
    "kohalpur",
    "birendranagar",
    "attariya",
    "lalbandi",
  ];

  let totalUpdatedAcrossMarkets = 0;

  for (const slug of marketQueue) {
    const ampisId = AMPIS_MARKET_IDS[slug];
    const mId = marketSlugMap.get(slug);
    if (!ampisId || !mId) {
      console.log(`  ⚠ Skipping ${slug}: Market ID not found in database.`);
      continue;
    }

    try {
      const rows = await fetchLiveMarket(slug, ampisId, ampisYearId, ampisMonthId, bsDay);
      if (!rows || rows.length === 0) {
        console.log(`  ℹ ${slug.toUpperCase()} bulletin was quiet or returned 0 rows today.`);
        continue;
      }

      console.log(`  📦 Extracted ${rows.length} real live commodities for ${slug.toUpperCase()}!`);

      // 1. Clear conflicting records for this market and date to guarantee live overwrite of stale seed data
      await db
        .delete(schema.canonicalDailyMarketPrices)
        .where(
          and(
            eq(schema.canonicalDailyMarketPrices.marketId, mId),
            eq(schema.canonicalDailyMarketPrices.dateAd, dateAdStr)
          )
        );

      let marketInsertCount = 0;

      for (const row of rows) {
        let commId = commMap.get(row.commodityNameNe.trim());

        // Auto-register if not yet in database
        if (!commId) {
          const generatedCode = `AMPIS-LIVE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
          const [newComm] = await db
            .insert(schema.ampisCommodities)
            .values({
              code: generatedCode,
              nameEn: row.commodityNameNe.trim(),
              nameNe: row.commodityNameNe.trim(),
              categoryEn: row.categoryNe.trim(),
              categoryNe: row.categoryNe.trim(),
              canonicalUnit: row.unit || "kg",
              isPriorityTier1: true,
            })
            .onConflictDoNothing()
            .returning({ id: schema.ampisCommodities.id });

          if (newComm) {
            commId = newComm.id;
            commMap.set(row.commodityNameNe.trim(), commId);
          } else {
            const existing = await db
              .select({ id: schema.ampisCommodities.id })
              .from(schema.ampisCommodities)
              .where(eq(schema.ampisCommodities.nameNe, row.commodityNameNe.trim()))
              .limit(1);
            if (existing[0]) {
              commId = existing[0].id;
              commMap.set(row.commodityNameNe.trim(), commId);
            } else {
              continue;
            }
          }
        }

        const min = row.minPrice ?? row.avgPrice ?? 0;
        const max = row.maxPrice ?? row.avgPrice ?? min;
        const rep = row.avgPrice ?? (min + max) / 2;
        if (rep <= 0) continue;

        await db
          .insert(schema.canonicalDailyMarketPrices)
          .values({
            marketId: mId,
            ampisCommodityId: commId,
            dateAd: dateAdStr,
            bsYear,
            bsMonth,
            bsDay,
            minPrice: min.toFixed(2),
            maxPrice: max.toFixed(2),
            representativePrice: rep.toFixed(2),
            priceMeasureType: slug === "kalimati" ? "ARITHMETIC_MEAN" : "MIDPOINT",
            canonicalUnit: row.unit || "kg",
            version: 1,
            isCurrent: true,
            sourceObservationId: obsId,
          })
          .onConflictDoUpdate({
            target: [
              schema.canonicalDailyMarketPrices.marketId,
              schema.canonicalDailyMarketPrices.ampisCommodityId,
              schema.canonicalDailyMarketPrices.dateAd,
            ],
            targetWhere: sql`is_current = true`,
            set: {
              minPrice: min.toFixed(2),
              maxPrice: max.toFixed(2),
              representativePrice: rep.toFixed(2),
              priceMeasureType: slug === "kalimati" ? "ARITHMETIC_MEAN" : "MIDPOINT",
              canonicalUnit: row.unit || "kg",
              createdAt: sql`now()`,
            },
          });

        marketInsertCount++;

        if (slug === "kalimati" && (row.commodityNameNe.includes("गोलभेंडा ठुलो") || row.commodityNameNe.includes("काउली (स्थानीय)"))) {
          console.log(`  ✓ [Kalimati Highlight] ${row.commodityNameNe} ➔ Min: रु.${min} | Max: रु.${max} | Avg: रु.${rep}`);
        }
      }

      totalUpdatedAcrossMarkets += marketInsertCount;
      console.log(`  ✅ Successfully committed ${marketInsertCount} live records for ${slug.toUpperCase()}!`);
    } catch (err: any) {
      console.error(`  ❌ Error processing ${slug}:`, err.message);
    }
  }

  console.log(`\n🎉 SUCCESS! All available government live bulletins committed to Neon (${totalUpdatedAcrossMarkets} total price records for ${dateAdStr})!`);
}

// Run if called directly
runLiveIngestion().catch(console.error);