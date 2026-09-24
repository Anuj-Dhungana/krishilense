import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import NepaliDate from "nepali-date-converter";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function seedRecentHistory() {
  console.log("📈 Seeding 14 Days of Recent Daily Price Fluctuations for Meat & Dairy...\n");

  const kalimati = await db.select().from(schema.markets).where(eq(schema.markets.publicSlug, "kalimati")).limit(1);
  const marketId = kalimati[0]?.id || 1;

  const comms = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(comms.map((c) => [c.code, c.id]));

  const firstObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = firstObs[0]?.id || 1;

  // Base items with typical daily fluctuation bands in Nepal
  const itemsToTrack = [
    { code: "523", name: "Broiler Chicken", base: 380, variance: 15, unit: "kg" },
    { code: "525", name: "Khasi Meat", base: 1200, variance: 30, unit: "kg" },
    { code: "512", name: "Pork (Bangur)", base: 450, variance: 15, unit: "kg" },
    { code: "507", name: "Cow Milk", base: 70, variance: 2, unit: "litre" },
    { code: "449", name: "Paneer", base: 710, variance: 20, unit: "kg" },
    { code: "401", name: "Rahu Fish", base: 300, variance: 15, unit: "kg" },
  ];

  const MS_PER_DAY = 86_400_000;
  const today = new Date();

  let insertedCount = 0;

  // Generate 14 days back
  for (let i = 14; i >= 1; i--) {
    const pastDate = new Date(today.getTime() - i * MS_PER_DAY);
    const dateAdStr = pastDate.toISOString().split("T")[0];
    const bsDate = new NepaliDate(pastDate);

    for (const item of itemsToTrack) {
      const commId = commMap.get(item.code);
      if (!commId) continue;

      // Realistic random daily fluctuation
      const noise = (Math.sin(i * 1.5) * item.variance);
      const rep = Number((item.base + noise).toFixed(2));
      const min = Number((rep - item.variance * 0.5).toFixed(2));
      const max = Number((rep + item.variance * 0.5).toFixed(2));

      await db
        .insert(schema.canonicalDailyMarketPrices)
        .values({
          marketId,
          ampisCommodityId: commId,
          dateAd: dateAdStr,
          bsYear: bsDate.getYear(),
          bsMonth: bsDate.getMonth() + 1,
          bsDay: bsDate.getDate(),
          minPrice: min.toFixed(2),
          maxPrice: max.toFixed(2),
          representativePrice: rep.toFixed(2),
          priceMeasureType: "ARITHMETIC_MEAN",
          canonicalUnit: item.unit,
          version: 1,
          isCurrent: true,
          sourceObservationId: obsId,
        })
        .onConflictDoNothing();

      insertedCount++;
    }
  }

  console.log(`✅ Success! Seeded ${insertedCount} daily price records across the past 14 days for Meat, Dairy, and Fish!`);
}

seedRecentHistory().catch(console.error);