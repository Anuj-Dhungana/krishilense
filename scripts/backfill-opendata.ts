import fs from "fs";

import csv from "csv-parser";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import { CSV_COMMODITY_MAP } from "../src/lib/ingestion/csv-name-map";
import NepaliDate from "nepali-date-converter";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

const CHUNK_SIZE = 500;

interface DailyPriceInsert {
  marketId: number;
  ampisCommodityId: number;
  dateAd: string;
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  minPrice: string;
  maxPrice: string;
  representativePrice: string;
  priceMeasureType: "ARITHMETIC_MEAN";
  canonicalUnit: string;
  version: number;
  isCurrent: boolean;
  sourceObservationId: number;
}

// Process both files with the complete commodity map
const FILES_TO_INGEST = [
  {
    path: "./data/kalimati_2021_2023.csv",
    label: "Part 2 (2021–2023)",
    hasHeaders: false,
    manualHeaders: ["Commodity", "Date", "Unit", "Minimum", "Maximum", "Average"],
  },
  {
    path: "./data/kalimati_2013_2021.csv",
    label: "Part 1 (2013–2021)",
    hasHeaders: true,
    manualHeaders: undefined,
  },
];

/**
 * Smart date parser that handles mixed M/D/YYYY, D/M/YYYY, and YYYY-MM-DD
 */
function parseFlexibleDate(rawDateStr: string): { dateAdFormatted: string; bsDate: NepaliDate } | null {
  if (!rawDateStr) return null;
  const clean = rawDateStr.trim();

  try {
    let year = 0;
    let month = 0;
    let day = 0;

    if (clean.includes("/")) {
      const parts = clean.split("/").map(Number);
      if (parts.length !== 3) return null;

      const [p1, p2, p3] = parts;
      year = p3 < 100 ? p3 + 2000 : p3; // Handle 2-digit years if any

      // If first number > 12, it's definitely DAY (D/M/YYYY)
      if (p1 > 12) {
        day = p1;
        month = p2;
      } 
      // If second number > 12, it's definitely DAY (M/D/YYYY)
      else if (p2 > 12) {
        month = p1;
        day = p2;
      } 
      // Default to M/D/YYYY for standard Kalimati export
      else {
        month = p1;
        day = p2;
      }
    } else if (clean.includes("-")) {
      const parts = clean.split("-").map(Number);
      if (parts.length !== 3) return null;
      [year, month, day] = parts;
    } else {
      return null;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2040) {
      return null;
    }

    const dateAdObj = new Date(year, month - 1, day);
    if (isNaN(dateAdObj.getTime())) return null;

    const dateAdFormatted = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const bsDate = new NepaliDate(dateAdObj);

    return { dateAdFormatted, bsDate };
  } catch {
    return null;
  }
}

async function processCsvFile(
  fileConfig: typeof FILES_TO_INGEST[0],
  marketId: number,
  commMap: Map<string, number>,
  obsId: number
) {
  if (!fs.existsSync(fileConfig.path)) {
    console.log(`ℹ️ Skipping ${fileConfig.label}: File not found at ${fileConfig.path}`);
    return;
  }

  console.log(`\n⏳ Ingesting ${fileConfig.label} from: ${fileConfig.path}...`);

  let rowsBuffer: DailyPriceInsert[] = [];
  let totalRows = 0;
  let insertedRows = 0;
  let skippedRows = 0;

  const stream = fs.createReadStream(fileConfig.path).pipe(
    fileConfig.hasHeaders ? csv() : csv({ headers: fileConfig.manualHeaders })
  );

  for await (const chunk of stream) {
    totalRows++;

    const commodityName = (chunk.Commodity || chunk.commodity || "").trim();
    const dateStr = (chunk.Date || chunk.date || "").trim();
    const minStr = chunk.Minimum || chunk.minimum || chunk.Min || chunk.min;
    const maxStr = chunk.Maximum || chunk.maximum || chunk.Max || chunk.max;
    const avgStr = chunk.Average || chunk.average || chunk.Avg || chunk.avg;

    const mappedCode = CSV_COMMODITY_MAP[commodityName];
    if (!mappedCode) {
      skippedRows++;
      continue;
    }

    const commodityId = commMap.get(mappedCode);
    if (!commodityId) {
      skippedRows++;
      continue;
    }

    const avg = parseFloat(avgStr);
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    if (isNaN(avg) || avg <= 0) continue;

    // Parse date with our flexible parser
    const parsedDate = parseFlexibleDate(dateStr);
    if (!parsedDate) continue;

    rowsBuffer.push({
      marketId: marketId,
      ampisCommodityId: commodityId,
      dateAd: parsedDate.dateAdFormatted,
      bsYear: parsedDate.bsDate.getYear(),
      bsMonth: parsedDate.bsDate.getMonth() + 1, // 1-12
      bsDay: parsedDate.bsDate.getDate(),
      minPrice: (isNaN(min) ? avg : min).toFixed(2),
      maxPrice: (isNaN(max) ? avg : max).toFixed(2),
      representativePrice: avg.toFixed(2),
      priceMeasureType: "ARITHMETIC_MEAN",
      canonicalUnit: "kg",
      version: 1,
      isCurrent: true,
      sourceObservationId: obsId,
    });

    // Flush in chunks of 500 rows
    if (rowsBuffer.length >= CHUNK_SIZE) {
      try {
        await db.insert(schema.canonicalDailyMarketPrices).values(rowsBuffer).onConflictDoNothing();
        insertedRows += rowsBuffer.length;
        process.stdout.write(`\r  💾 Inserted ${insertedRows} rows into Neon... (Processed: ${totalRows})`);
        rowsBuffer = [];
      } catch (err: unknown) {
        console.error("\n❌ Batch insert error:", err);
        rowsBuffer = [];
      }
    }
  }

  // Flush remaining buffer
  if (rowsBuffer.length > 0) {
    try {
      await db.insert(schema.canonicalDailyMarketPrices).values(rowsBuffer).onConflictDoNothing();
      insertedRows += rowsBuffer.length;
    } catch (err: unknown) {
      console.error("\n❌ Final batch insert error:", err);
    }
  }

  console.log(`\n\n✅ ${fileConfig.label} Complete!`);
  console.log(`  Total Processed: ${totalRows}`);
  console.log(`  Successfully Inserted: ${insertedRows}`);
  console.log(`  Skipped Unmapped: ${skippedRows}`);
}

async function runFullBackfill() {
  console.log("🚀 Starting Open Data Nepal Historical Ingestion Pipeline...\n");

  const kalimati = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.publicSlug, "kalimati"))
    .limit(1);

  if (!kalimati.length) throw new Error("Kalimati market not found in database.");
  const marketId = kalimati[0].id;

  const allComms = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allComms.map((c) => [c.code, c.id]));

  const firstObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = firstObs[0]?.id || 1;

  for (const file of FILES_TO_INGEST) {
    await processCsvFile(file, marketId, commMap, obsId);
  }

  console.log("\n🎉 Open Data Nepal Part 2 Ingestion Complete!");
}

runFullBackfill().catch(console.error);