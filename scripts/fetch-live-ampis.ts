import { parseAmpisHtml } from "../src/lib/ingestion/parsers/ampis-parser";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import NepaliDate from "nepali-date-converter";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { COMMODITY_EN_MAP } from "../src/lib/ingestion/commodity-translations";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

const AMPIS_MARKET_IDS: Record<string, string> = {
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

// AMPIS uses entity IDs for BS months rather than month numbers.
const AMPIS_MONTH_IDS: Record<number, number> = {
  1: 33,
  2: 34,
  3: 35,
  4: 36,
  5: 37,
  6: 38,
  7: 39,
  8: 40,
  9: 41,
  10: 42,
  11: 43,
  12: 44,
};

// AMPIS year entity IDs change when a new BS year is added.
const AMPIS_YEAR_IDS: Record<number, number> = {
  2080: 16,
  2081: 446538,
  2082: 894719,
  2083: 1614822,
};

async function fetchLiveMarketHtml(ampisId: string, bsYear: number, bsMonth: number, bsDay: number) {
  const yearId = AMPIS_YEAR_IDS[bsYear];
  const monthId = AMPIS_MONTH_IDS[bsMonth];
  if (!yearId || !monthId) {
    throw new Error(`AMPIS date filter is not configured for BS ${bsYear}-${bsMonth}-${bsDay}`);
  }

  const params = new URLSearchParams({
    uid_entityreference_filter: ampisId,
    field_market_rate_year_target_id_entityreference_filter: String(yearId),
    field_market_rate_month_target_id: String(monthId),
    field_market_rate_day_target_id: String(bsDay),
    field_commodity_category_target_id_entityreference_filter: "All",
    field_market_rate_commodity_target_id_entityreference_filter: "All",
  });
  const targetUrl = `https://ampis.gov.np/market-price-comparison?${params.toString()}`;
  
  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) return "";
  return await response.text();
}

async function runAmpisIngestion() {
  console.log("🚀 Starting AMPIS market ingestion...\n");

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
  const bsMonth = bsDate.getMonth() + 1;
  const bsDay = bsDate.getDate();

  // ---------------------------------------------------------------------------
  // 1. INGEST LIVE VEGETABLES & FRUITS FROM AMPIS FOR ALL 12 MARKETS
  // ---------------------------------------------------------------------------
  for (const [slug, ampisId] of Object.entries(AMPIS_MARKET_IDS)) {
    const marketId = marketSlugMap.get(slug);
    if (!marketId) continue;

    try {
      console.log(`🌐 Fetching live rates from AMPIS for ${slug.toUpperCase()} (ID: ${ampisId})...`);
      const html = await fetchLiveMarketHtml(ampisId, bsYear, bsMonth, bsDay);
      if (!html) continue;

      const parsedRows = parseAmpisHtml(html);
      console.log(`  ✓ Extracted ${parsedRows.length} live commodities from AMPIS for ${slug}`);

      for (const row of parsedRows) {
        const trimmedName = row.commodityNameNe.trim();
        let commId = commMap.get(trimmedName);

        // Auto-register new commodities if encountered
        if (!commId) {
          const generatedCode = `AMPIS-${Math.floor(100 + Math.random() * 900)}`;
          const englishName = COMMODITY_EN_MAP[trimmedName] || trimmedName;
          const [newComm] = await db
            .insert(schema.ampisCommodities)
            .values({
              code: generatedCode,
              nameEn: englishName,
              nameNe: trimmedName,
              categoryEn: row.categoryNe,
              categoryNe: row.categoryNe,
              canonicalUnit: row.unit || "kg",
              isPriorityTier1: true,
            })
            .onConflictDoNothing()
            .returning({ id: schema.ampisCommodities.id });

          if (newComm) {
            commId = newComm.id;
            commMap.set(trimmedName, commId);
          } else {
            // If already exists under another code
            const existing = await db.select().from(schema.ampisCommodities).where(eq(schema.ampisCommodities.nameNe, trimmedName)).limit(1);
            if (existing[0]) {
              commId = existing[0].id;
              commMap.set(trimmedName, commId);
            } else {
              continue;
            }
          }
        }

        const min = row.minPrice ?? row.avgPrice ?? 0;
        const max = row.maxPrice ?? row.avgPrice ?? min;
        const rep = row.avgPrice ?? (min + max) / 2;
        if (rep <= 0) continue;

        // Store AMPIS values without regional estimates or other transformations.
        await sql`
          INSERT INTO canonical_daily_market_prices (
            market_id, ampis_commodity_id, date_ad, bs_year, bs_month, bs_day,
            min_price, max_price, representative_price, price_measure_type,
            canonical_unit, version, is_current, source_observation_id
          ) VALUES (
            ${marketId}, ${commId}, ${dateAdStr}, ${bsYear}, ${bsMonth}, ${bsDay},
            ${min.toFixed(2)}, ${max.toFixed(2)}, ${rep.toFixed(2)},
            ${"ARITHMETIC_MEAN"},
            ${row.unit || "kg"}, 1, true, ${obsId}
          )
          ON CONFLICT (market_id, ampis_commodity_id, date_ad) WHERE is_current = true
          DO UPDATE SET
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            representative_price = EXCLUDED.representative_price;
        `;

      }
    } catch {
      console.log(`  ℹ Could not fetch live feed for ${slug}.`);
    }
  }

  console.log("\n🎉 AMPIS ingestion complete. Stored source values without estimates.");
}

runAmpisIngestion().catch(console.error);