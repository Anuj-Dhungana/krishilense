import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import { desc } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function inspect() {
  console.log("🔍 Reading Batch #1 from Neon 'raw_ingestion_batches'...\n");

  const batches = await db
    .select({
      id: schema.rawIngestionBatches.id,
      fetchedAt: schema.rawIngestionBatches.fetchedAt,
      checksum: schema.rawIngestionBatches.payloadChecksumSha256,
      payload: schema.rawIngestionBatches.rawPayload,
    })
    .from(schema.rawIngestionBatches)
    .orderBy(desc(schema.rawIngestionBatches.id))
    .limit(1);

  if (batches.length === 0) {
    console.log("❌ No batches found in database.");
    return;
  }

  const batch = batches[0];
  console.log(`📦 Found Batch #${batch.id} (${batch.payload.length} characters)`);
  console.log(`SHA-256 Checksum: ${batch.checksum}\n`);

  // Look for <table> or pricing tables in the HTML
  const tableMatch = batch.payload.match(/<table[\s\S]*?<\/table>/i);

  if (tableMatch) {
    console.log("✅ Found an HTML <table>! Here is the first part of the table structure:\n");
    console.log(tableMatch[0].slice(0, 1500));
  } else {
    console.log("ℹ️ No <table> tag found. First 800 characters of the raw payload:\n");
    console.log(batch.payload.slice(0, 800));
  }
}

inspect().catch(console.error);