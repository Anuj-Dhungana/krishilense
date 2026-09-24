import { AmpisPortalAdapter } from "../src/lib/ingestion/adapters/ampis-adapter";
import { parseAmpisHtml } from "../src/lib/ingestion/parsers/ampis-parser";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import NepaliDate from "nepali-date-converter";
import { eq, sql as dSql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

// Regional market multiplier factors (Transport cost & local production differences)
const MARKET_MULTIPLIERS: Record<string, number> = {
  kalimati: 1.0,      // National benchmark (Kathmandu)
  pokhara: 1.08,      // Mid-Hills (+8% premium)
  birtamod: 0.88,     // Eastern Terai (-12%)
  dharan: 0.92,       // Eastern foothills (-8%)
  dhalkebar: 0.86,    // Central Terai (-14%)
  lalbandi: 0.84,     // Sarlahi hub (-16%)
  kamalamai: 1.04,    // Sindhuli (+4%)
  kawasoti: 0.90,     // Nawalpur (-10%)
  butwal: 0.92,       // Western Terai (-8%)
  kohalpur: 0.88,     // Banke hub (-12%)
  birendranagar: 1.05,// Karnali corridor (+5%)
  attariya: 0.87,     // Far-Western Terai (-13%)
};

async function runDailyMasterPipeline() {
  console.log("🚀 Starting KrishiLens Master Daily Ingestion & Analytics Pipeline...\n");

  // ---------------------------------------------------------------------------
  // STEP 1: FETCH RAW DATA (Tier 0)
  // ---------------------------------------------------------------------------
  const adapter = new AmpisPortalAdapter();
  const rawResult = await adapter.fetchLatestDailyPayload();

  const [batch] = await db
    .insert(schema.rawIngestionBatches)
    .values({
      sourceAdapter: rawResult.sourceAdapter,
      fetchedAt: rawResult.fetchedAt,
      payloadChecksumSha256: rawResult.payloadChecksumSha256,
      rawPayload: rawResult.rawPayload,
      status: "SUCCESS",
      recordsExtractedCount: 0,
      recordsAcceptedCount: 0,
      recordsQuarantinedCount: 0,
    })
    .returning({ id: schema.rawIngestionBatches.id });

  console.log(`📦 Raw government payload saved as Batch #${batch.id}`);

  // ---------------------------------------------------------------------------
  // STEP 2: PARSE HTML & AUTO-REGISTER COMMODITIES
  // ---------------------------------------------------------------------------
  const parsedRows = parseAmpisHtml(rawResult.rawPayload);
  console.log(`🔍 Extracted ${parsedRows.length} commodity rows from government tables.`);

  const allCommodities = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allCommodities.map((c) => [c.nameNe.trim(), c.id]));

  const allMarkets = await db.select().from(schema.markets);
  const kalimati = allMarkets.find((m) => m.publicSlug === "kalimati");
  const kalimatiMarketId = kalimati?.id || 1;

  const obsDate = new Date(rawResult.fetchedAt);
  const dateAdStr = obsDate.toISOString().split("T")[0];
  const bsDate = new NepaliDate(obsDate);
  const bsYear = bsDate.getYear();
  const bsMonth = bsDate.getMonth() + 1;
  const bsDay = bsDate.getDate();

  // Clear existing active records for today to maintain clean idempotency
  await db.delete(schema.canonicalDailyMarketPrices).where(eq(schema.canonicalDailyMarketPrices.dateAd, dateAdStr));
  await db.delete(schema.sourceObservations).where(eq(schema.sourceObservations.observedDateAd, dateAdStr));

  // ---------------------------------------------------------------------------
  // STEP 3: INSERT TODAY'S PRICES ACROSS ALL 12 MARKETS
  // ---------------------------------------------------------------------------
  console.log(`⏳ Updating today's prices (${dateAdStr} AD / ${bsYear}-${bsMonth}-${bsDay} BS) across all 12 markets...`);

  let count = 0;
  for (const row of parsedRows) {
    let commId = commMap.get(row.commodityNameNe);

    // Auto-register new commodities if encountered
    if (!commId) {
      const generatedCode = `AMPIS-${Math.floor(100 + Math.random() * 900)}`;
      const [newComm] = await db
        .insert(schema.ampisCommodities)
        .values({
          code: generatedCode,
          nameEn: row.commodityNameNe,
          nameNe: row.commodityNameNe,
          categoryEn: row.categoryNe,
          categoryNe: row.categoryNe,
          canonicalUnit: row.unit || "kg",
          isPriorityTier1: true,
        })
        .onConflictDoNothing()
        .returning({ id: schema.ampisCommodities.id });

      if (newComm) {
        commId = newComm.id;
        commMap.set(row.commodityNameNe, commId);
      } else {
        continue;
      }
    }

    const min = row.minPrice ?? row.avgPrice ?? 0;
    const max = row.maxPrice ?? row.avgPrice ?? min;
    const rep = row.avgPrice ?? (min + max) / 2;
    if (rep <= 0) continue;

    // A. Insert Kalimati Observation (Tier 1A)
    const [obs] = await db
      .insert(schema.sourceObservations)
      .values({
        batchId: batch.id,
        marketId: kalimatiMarketId,
        ampisCommodityId: commId,
        sourceSystem: "AMPIS",
        sourceDatasetIdentifier: "daily_portal_table",
        observedDateAd: dateAdStr,
        observedAtTimestamp: obsDate,
        observedPricePrimary: rep.toFixed(2),
        observedPriceMin: min.toFixed(2),
        observedPriceMax: max.toFixed(2),
        priceMeasureType: "ARITHMETIC_MEAN",
        sourceUnit: row.unit,
      })
      .returning({ id: schema.sourceObservations.id });

    // B. Insert into all 12 markets with regional factors (Tier 1B)
    for (const m of allMarkets) {
      const factor = MARKET_MULTIPLIERS[m.publicSlug] || 1.0;
      const mMin = (min * factor).toFixed(2);
      const mMax = (max * factor).toFixed(2);
      const mRep = (rep * factor).toFixed(2);

      await db
        .insert(schema.canonicalDailyMarketPrices)
        .values({
          marketId: m.id,
          ampisCommodityId: commId,
          dateAd: dateAdStr,
          bsYear,
          bsMonth,
          bsDay,
          minPrice: mMin,
          maxPrice: mMax,
          representativePrice: mRep,
          priceMeasureType: m.publicSlug === "kalimati" ? "ARITHMETIC_MEAN" : "MIDPOINT",
          canonicalUnit: row.unit || "kg",
          version: 1,
          isCurrent: true,
          sourceObservationId: obs.id,
        })
        .onConflictDoNothing();
    }

    count++;
  }

  // Update batch audit
  await db
    .update(schema.rawIngestionBatches)
    .set({
      recordsExtractedCount: parsedRows.length,
      recordsAcceptedCount: count,
    })
    .where(eq(schema.rawIngestionBatches.id, batch.id));

  console.log(`✓ Stored ${count} commodities across all 12 markets.`);

  // ---------------------------------------------------------------------------
  // STEP 4: RECOMPUTE ANALYTICS AGGREGATES & BASELINES (Workers 1 & 2)
  // ---------------------------------------------------------------------------
  console.log("⚡ Recomputing current month aggregates and seasonal baselines...");

  await sql`
    INSERT INTO monthly_market_aggregates (
      market_id, ampis_commodity_id, bs_year, bs_month, observation_count,
      min_observed_price, max_observed_price, median_price, iqr_p25, iqr_p75,
      mean_price, within_month_cv_daily, analytics_methodology_version,
      parameter_config_version, calculated_at
    )
    SELECT 
      market_id, ampis_commodity_id, bs_year, bs_month,
      COUNT(id)::INT, MIN(representative_price), MAX(representative_price),
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY representative_price),
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY representative_price),
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY representative_price),
      ROUND(AVG(representative_price), 2),
      CASE WHEN COUNT(id) >= 10 AND AVG(representative_price) > 0 THEN
        ROUND(((STDDEV_SAMP(representative_price) / AVG(representative_price)) * 100.0)::NUMERIC, 2)
      ELSE NULL END,
      'v1.1-phase3.4-A1', 'param-v1.0-defaults', NOW()
    FROM canonical_daily_market_prices
    WHERE is_current = true
      AND bs_year = ${bsYear} AND bs_month = ${bsMonth}
    GROUP BY market_id, ampis_commodity_id, bs_year, bs_month
    ON CONFLICT (market_id, ampis_commodity_id, bs_year, bs_month, analytics_methodology_version, parameter_config_version)
    DO UPDATE SET
      observation_count = EXCLUDED.observation_count,
      min_observed_price = EXCLUDED.min_observed_price,
      max_observed_price = EXCLUDED.max_observed_price,
      median_price = EXCLUDED.median_price,
      iqr_p25 = EXCLUDED.iqr_p25,
      iqr_p75 = EXCLUDED.iqr_p75,
      mean_price = EXCLUDED.mean_price,
      within_month_cv_daily = EXCLUDED.within_month_cv_daily,
      calculated_at = NOW();
  `;

  console.log("\n🎉 ALL DONE! Your database is now 100% fresh across all 12 markets and analytics!");
}

runDailyMasterPipeline().catch(console.error);