import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";


dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function seedRegional() {
  console.log("📍 Seeding Regional Market Prices for Comparison...\n");

  const markets = await db.select().from(schema.markets);
  const marketMap = new Map(markets.map((m) => [m.publicSlug, m.id]));

  const commodities = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(commodities.map((c) => [c.code, c.id]));

  // Today's date
  const today = new Date();
  const dateAdStr = today.toISOString().split("T")[0];

  // Sample regional wholesale prices across hubs for Tomato (101.1), Cauliflower (110.1), Potato (104.1)
  const regionalData = [
    // Pokhara
    { marketSlug: "pokhara", code: "101.1", min: "52.00", max: "60.00", rep: "56.00" },
    { marketSlug: "pokhara", code: "110.1", min: "85.00", max: "95.00", rep: "90.00" },
    { marketSlug: "pokhara", code: "104.1", min: "38.00", max: "42.00", rep: "40.00" },

    // Birtamod (Jhapa - Terai)
    { marketSlug: "birtamod", code: "101.1", min: "40.00", max: "48.00", rep: "44.00" },
    { marketSlug: "birtamod", code: "110.1", min: "70.00", max: "80.00", rep: "75.00" },
    { marketSlug: "birtamod", code: "104.1", min: "30.00", max: "34.00", rep: "32.00" },

    // Dharan
    { marketSlug: "dharan", code: "101.1", min: "42.00", max: "50.00", rep: "46.00" },
    { marketSlug: "dharan", code: "110.1", min: "72.00", max: "82.00", rep: "77.00" },

    // Butwal
    { marketSlug: "butwal", code: "101.1", min: "45.00", max: "52.00", rep: "48.50" },
    { marketSlug: "butwal", code: "104.1", min: "32.00", max: "36.00", rep: "34.00" },
  ];

  // We need a dummy observation id or create source observations
  const dummyObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = dummyObs[0]?.id || 1;

  for (const item of regionalData) {
    const mId = marketMap.get(item.marketSlug);
    const cId = commMap.get(item.code);
    if (!mId || !cId) continue;

    await db
      .insert(schema.canonicalDailyMarketPrices)
      .values({
        marketId: mId,
        ampisCommodityId: cId,
        dateAd: dateAdStr,
        bsYear: 2083,
        bsMonth: 6,
        bsDay: 6,
        minPrice: item.min,
        maxPrice: item.max,
        representativePrice: item.rep,
        priceMeasureType: "MIDPOINT",
        canonicalUnit: "kg",
        version: 1,
        isCurrent: true,
        sourceObservationId: obsId,
      })
      .onConflictDoNothing();
  }

  console.log("✅ Regional Wholesale Prices Seeded for Pokhara, Birtamod, Dharan, and Butwal!");
}

seedRegional().catch(console.error);