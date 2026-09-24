import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import NepaliDate from "nepali-date-converter";
import { eq, desc } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

const CHUNK_SIZE = 500;

async function seedAllDailyHistory() {
  console.log("📈 Generating 14-Day Daily Price Fluctuation Series for ALL Commodities Across ALL Categories...\n");

  const kalimati = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.publicSlug, "kalimati"))
    .limit(1);

  if (!kalimati.length) throw new Error("Kalimati market not found.");
  const marketId = kalimati[0].id;

  // 1. Get ALL commodities registered in your database
  const allCommodities = await db.select().from(schema.ampisCommodities);
  console.log(`📦 Found ${allCommodities.length} total commodities across all categories.`);

  // 2. Get a valid source observation ID for foreign key
  const firstObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = firstObs[0]?.id || 1;

  const MS_PER_DAY = 86_400_000;
  const today = new Date();

  let rowsBuffer: any[] = [];
  let totalInserted = 0;

  // 3. Loop over EVERY commodity
  for (const comm of allCommodities) {
    // Look up today's latest representative price as the base price
    const latestPrice = await db
      .select({ rep: schema.canonicalDailyMarketPrices.representativePrice })
      .from(schema.canonicalDailyMarketPrices)
      .where(eq(schema.canonicalDailyMarketPrices.ampisCommodityId, comm.id))
      .orderBy(desc(schema.canonicalDailyMarketPrices.dateAd))
      .limit(1);

    // If no today price exists, default to a realistic category baseline
    const basePrice = latestPrice[0] ? parseFloat(latestPrice[0].rep) : (comm.canonicalUnit === "litre" ? 70 : 60);

    // Realistic volatility depending on category:
    // Leafy greens/vegetables fluctuate more (~6%); grains/dairy fluctuate less (~2%)
    const variancePercent = 
      comm.categoryNe === "सागपात" || comm.categoryNe === "तरकारी" ? 0.07 :
      comm.categoryNe === "खाद्यान्न बाली" || comm.categoryNe === "दुग्धजन्य" ? 0.025 : 0.045;

    // Generate 14 continuous days back
    for (let dayOffset = 14; dayOffset >= 1; dayOffset--) {
      const pastDate = new Date(today.getTime() - dayOffset * MS_PER_DAY);
      const dateAdStr = pastDate.toISOString().split("T")[0];
      const bsDate = new NepaliDate(pastDate);

      // Realistic market wave oscillation
      const dailyNoise = Math.sin((dayOffset + comm.id) * 0.8) * (basePrice * variancePercent);
      const repPrice = Number(Math.max(5, basePrice + dailyNoise).toFixed(2));
      const minPrice = Number((repPrice * 0.92).toFixed(2));
      const maxPrice = Number((repPrice * 1.08).toFixed(2));

      rowsBuffer.push({
        marketId: marketId,
        ampisCommodityId: comm.id,
        dateAd: dateAdStr,
        bsYear: bsDate.getYear(),
        bsMonth: bsDate.getMonth() + 1, // 1-12
        bsDay: bsDate.getDate(),
        minPrice: minPrice.toFixed(2),
        maxPrice: maxPrice.toFixed(2),
        representativePrice: repPrice.toFixed(2),
        priceMeasureType: "ARITHMETIC_MEAN" as const,
        canonicalUnit: comm.canonicalUnit,
        version: 1,
        isCurrent: true,
        sourceObservationId: obsId,
      });

      // Flush in chunks of 500
      if (rowsBuffer.length >= CHUNK_SIZE) {
        await db.insert(schema.canonicalDailyMarketPrices).values(rowsBuffer).onConflictDoNothing();
        totalInserted += rowsBuffer.length;
        process.stdout.write(`\r  💾 Inserted ${totalInserted} daily price points into Neon...`);
        rowsBuffer = [];
      }
    }
  }

  // Flush remaining rows
  if (rowsBuffer.length > 0) {
    await db.insert(schema.canonicalDailyMarketPrices).values(rowsBuffer).onConflictDoNothing();
    totalInserted += rowsBuffer.length;
  }

  console.log(`\n\n🎉 COMPLETE! Generated continuous 14-day daily price fluctuation series for ALL ${allCommodities.length} commodities!`);
}

seedAllDailyHistory().catch(console.error);