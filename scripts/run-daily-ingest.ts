import { AmpisPortalAdapter } from "../src/lib/ingestion/adapters/ampis-adapter";
import { parseAmpisHtml } from "../src/lib/ingestion/parsers/ampis-parser";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import NepaliDate from "nepali-date-converter";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function runDailyPipeline() {
  console.log("🚀 Running KrishiLens Daily Ingestion & Normalization Pipeline...\n");

  // Step 1: Fetch Raw Payload (Tier 0)
  const adapter = new AmpisPortalAdapter();
  const rawResult = await adapter.fetchLatestDailyPayload();

  // Step 2: Store in raw_ingestion_batches
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

  console.log(`📦 Raw payload saved as Batch #${batch.id}`);

  // Step 3: Parse HTML into structured rows
  const parsedRows = parseAmpisHtml(rawResult.rawPayload);
  console.log(`🔍 Extracted ${parsedRows.length} commodity rows from HTML.`);

  // Step 4: Map and store into Tier 1A & Tier 1B (Auto-registers any new commodity!)
  const allCommodities = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allCommodities.map((c) => [c.nameNe.trim(), c.id]));

  const kalimati = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.publicSlug, "kalimati"))
    .limit(1);

  const marketId = kalimati[0]?.id || 1;

  const obsDate = new Date(rawResult.fetchedAt);
  const dateAdStr = obsDate.toISOString().split("T")[0];
  const bsDate = new NepaliDate(obsDate);
  const bsYear = bsDate.getYear();
  const bsMonth = bsDate.getMonth() + 1;
  const bsDay = bsDate.getDate();

  let count = 0;
  for (const row of parsedRows) {
    let commId = commMap.get(row.commodityNameNe);

    // If this commodity (e.g. apple, banana, spinach) is not registered yet, auto-register it!
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

    const [obs] = await db
      .insert(schema.sourceObservations)
      .values({
        batchId: batch.id,
        marketId,
        ampisCommodityId: commId,
        sourceSystem: "AMPIS",
        sourceDatasetIdentifier: "daily_portal_table",
        observedDateAd: dateAdStr,
        observedAtTimestamp: obsDate,
        observedPricePrimary: rep.toFixed(2),
        observedPriceMin: min.toFixed(2),
        observedPriceMax: max.toFixed(2),
        priceMeasureType: "MIDPOINT",
        sourceUnit: row.unit,
      })
      .returning({ id: schema.sourceObservations.id });

    await db
      .insert(schema.canonicalDailyMarketPrices)
      .values({
        marketId,
        ampisCommodityId: commId,
        dateAd: dateAdStr,
        bsYear,
        bsMonth,
        bsDay,
        minPrice: min.toFixed(2),
        maxPrice: max.toFixed(2),
        representativePrice: rep.toFixed(2),
        priceMeasureType: "MIDPOINT",
        canonicalUnit: row.unit || "kg",
        version: 1,
        isCurrent: true,
        sourceObservationId: obs.id,
      })
      .onConflictDoNothing();

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

  console.log(`✅ Pipeline Complete! ${count} canonical prices updated for today.`);
}

runDailyPipeline().catch(console.error);