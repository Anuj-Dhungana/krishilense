import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import { AmpisPortalAdapter } from "../src/lib/ingestion/adapters/ampis-adapter";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function runRawIngest() {
  console.log("🚀 Testing Tier 0 Raw Ingestion Pipeline...\n");

  const adapter = new AmpisPortalAdapter();

  try {
    // 1. Fetch raw data from AMPIS
    const result = await adapter.fetchLatestDailyPayload();

    // 2. Check idempotency: Have we already stored this exact payload?
    const existing = await db
      .select({ id: schema.rawIngestionBatches.id })
      .from(schema.rawIngestionBatches)
      .where(eq(schema.rawIngestionBatches.payloadChecksumSha256, result.payloadChecksumSha256))
      .limit(1);

    if (existing.length > 0) {
      console.log(`ℹ️ Payload already exists in Neon (Batch ID #${existing[0].id}). Idempotency preserved!`);
      return;
    }

    // 3. Save raw payload into Tier 0 table (raw_ingestion_batches)
    const inserted = await db
      .insert(schema.rawIngestionBatches)
      .values({
        sourceAdapter: result.sourceAdapter,
        fetchedAt: result.fetchedAt,
        payloadChecksumSha256: result.payloadChecksumSha256,
        rawPayload: result.rawPayload,
        status: "SUCCESS",
        recordsExtractedCount: 0, // Will be updated when parser runs in Step 6.8
        recordsAcceptedCount: 0,
        recordsQuarantinedCount: 0,
      })
      .returning({ id: schema.rawIngestionBatches.id });

    console.log(`\n🎉 SUCCESS! Raw payload saved to Neon in 'raw_ingestion_batches' as Batch ID #${inserted[0].id}`);
  } catch (err) {
    console.error("❌ Raw ingestion failed:", err);
    process.exit(1);
  }
}

runRawIngest();