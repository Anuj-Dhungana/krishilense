import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import { parseAmpisHtml } from "../src/lib/ingestion/parsers/ampis-parser";
import NepaliDate from "nepali-date-converter";
import { desc, eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function parseAndStoreBatch() {
  console.log("⚙️ Starting Batch Parser & Normalization Pipeline...\n");

  // 1. Fetch latest raw batch
  const batches = await db
    .select()
    .from(schema.rawIngestionBatches)
    .orderBy(desc(schema.rawIngestionBatches.id))
    .limit(1);

  if (!batches.length) {
    console.log("❌ No batch found.");
    return;
  }

  const batch = batches[0];
  console.log(`📦 Loaded Batch #${batch.id} (${batch.rawPayload.length} bytes)`);

  // 2. Parse HTML
  const parsedRows = parseAmpisHtml(batch.rawPayload);
  console.log(`🔍 Extracted ${parsedRows.length} total commodity rows from HTML tables!`);

  // 3. Load Commodities & Default Market (Kalimati) from Neon
  const allCommodities = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allCommodities.map((c) => [c.nameNe.trim(), c.id]));

  const kalimatiMarket = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.publicSlug, "kalimati"))
    .limit(1);

  if (!kalimatiMarket.length) {
    throw new Error("Kalimati market not found in database.");
  }
  const marketId = kalimatiMarket[0].id;

  // 4. Determine Date (Gregorian AD and Bikram Sambat BS)
  const obsDate = new Date(batch.fetchedAt);
  const dateAdStr = obsDate.toISOString().split("T")[0]; // YYYY-MM-DD
  const bsDate = new NepaliDate(obsDate);
  const bsYear = bsDate.getYear();
  const bsMonth = bsDate.getMonth() + 1; // 1-12
  const bsDay = bsDate.getDate();

  console.log(`📅 Observation Date: ${dateAdStr} AD (${bsYear}-${bsMonth}-${bsDay} BS)\n`);

  // Clear any existing test records for this date to ensure fresh numbers
  await db.delete(schema.canonicalDailyMarketPrices).where(eq(schema.canonicalDailyMarketPrices.dateAd, dateAdStr));
  await db.delete(schema.sourceObservations).where(eq(schema.sourceObservations.observedDateAd, dateAdStr));

  let acceptedCount = 0;
  let skippedUnmapped = 0;

  for (const row of parsedRows) {
    const commodityId = commMap.get(row.commodityNameNe);

    if (!commodityId) {
      skippedUnmapped++;
      continue;
    }

    const minPrice = row.minPrice ?? row.avgPrice ?? 0;
    const maxPrice = row.maxPrice ?? row.avgPrice ?? minPrice;
    const repPrice = row.avgPrice ?? (minPrice + maxPrice) / 2;

    if (repPrice <= 0) continue;

    // A. Insert into Tier 1A: source_observations
    const [insertedObs] = await db
      .insert(schema.sourceObservations)
      .values({
        batchId: batch.id,
        marketId: marketId,
        ampisCommodityId: commodityId,
        sourceSystem: "AMPIS",
        sourceDatasetIdentifier: "daily_portal_table",
        observedDateAd: dateAdStr,
        observedAtTimestamp: obsDate,
        observedPricePrimary: repPrice.toFixed(2),
        observedPriceMin: minPrice.toFixed(2),
        observedPriceMax: maxPrice.toFixed(2),
        priceMeasureType: "MIDPOINT",
        sourceUnit: row.unit,
      })
      .returning({ id: schema.sourceObservations.id });

    // B. Insert into Tier 1B: canonical_daily_market_prices (Versioned)
    await db
      .insert(schema.canonicalDailyMarketPrices)
      .values({
        marketId: marketId,
        ampisCommodityId: commodityId,
        dateAd: dateAdStr,
        bsYear: bsYear,
        bsMonth: bsMonth,
        bsDay: bsDay,
        minPrice: minPrice.toFixed(2),
        maxPrice: maxPrice.toFixed(2),
        representativePrice: repPrice.toFixed(2),
        priceMeasureType: "MIDPOINT",
        canonicalUnit: "kg",
        version: 1,
        isCurrent: true,
        sourceObservationId: insertedObs.id,
      })
      .onConflictDoNothing();

    acceptedCount++;
    console.log(`  ✓ Stored: ${row.commodityNameNe} ➔ Min: रु.${minPrice} | Max: रु.${maxPrice} | Avg: रु.${repPrice}/kg`);
  }

  // 5. Update Batch Audit Statistics
  await db
    .update(schema.rawIngestionBatches)
    .set({
      recordsExtractedCount: parsedRows.length,
      recordsAcceptedCount: acceptedCount,
    })
    .where(eq(schema.rawIngestionBatches.id, batch.id));

  console.log(`\n🎉 DONE! Extracted: ${parsedRows.length} | Stored into Neon: ${acceptedCount} | Skipped unmapped: ${skippedUnmapped}`);
}

parseAndStoreBatch().catch((err) => {
  console.error("❌ Parser failed:", err);
  process.exit(1);
});