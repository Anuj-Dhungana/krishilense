import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function seedMeatAndLivestock() {
  console.log("🥩 Seeding Meat & Livestock Products into KrishiLens...\n");

  // ============================================================================
  // 1. ADD COMMODITIES INTO ampis_commodities
  // ============================================================================
  const meatCommodities = [
    // Dressed Meat (तयारी मासु)
    { code: "523",   nameEn: "Broiler Chicken (Dressed)", nameNe: "कुखुराको मासु (बोईलर)", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "524",   nameEn: "Local Chicken (Dressed)", nameNe: "कुखुराको मासु (लोकल)", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "525",   nameEn: "Goat Meat / Khasi (Dressed)", nameNe: "खसीको मासु", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "512",   nameEn: "Pork (Bangur)", nameNe: "बंगुरको मासु", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "526.1", nameEn: "Buff Meat (Ranga)", nameNe: "राँगाको मासु", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "kg", isPriorityTier1: true },

    // Live Weight (जिउँदो तौल - Farmgate)
    { code: "527.1", nameEn: "Live Broiler Chicken", nameNe: "जिउँदो कुखुरा (बोईलर)", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "528.1", nameEn: "Live Goat (Khasi/Boka)", nameNe: "जिउँदो खसी/बोका", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "kg", isPriorityTier1: true },

    // Eggs
    { code: "522",   nameEn: "Eggs (Large Crate)", nameNe: "अण्डा (ठुलो क्यारेट)", categoryEn: "Meat", categoryNe: "मासु", canonicalUnit: "crate", isPriorityTier1: true },
  ];

  await db.insert(schema.ampisCommodities).values(meatCommodities).onConflictDoNothing();
  const allComms = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allComms.map((c) => [c.code, c.id]));
  console.log(`✓ Confirmed ${allComms.length} total commodities in database.`);

  // ============================================================================
  // 2. SEED ACTIVE DAILY WHOLESALE PRICES ACROSS ALL 12 MARKETS
  // ============================================================================
  console.log("📊 Adding Active Daily Meat Prices across Markets...");

  const markets = await db.select().from(schema.markets);
  const firstObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = firstObs[0]?.id || 1;

  const today = new Date();
  const dateAdStr = today.toISOString().split("T")[0];

  // Nepal poultry & livestock rates in NPR
  const meatRates: Record<string, { min: number; max: number; rep: number; unit: string }> = {
    "523":   { min: 360, max: 400, rep: 380, unit: "kg" },    // Broiler Dressed
    "524":   { min: 550, max: 650, rep: 600, unit: "kg" },    // Local Chicken Dressed
    "525":   { min: 1100, max: 1300, rep: 1200, unit: "kg" }, // Khasi Dressed Meat
    "512":   { min: 420, max: 480, rep: 450, unit: "kg" },    // Pork (Bangur)
    "526.1": { min: 320, max: 360, rep: 340, unit: "kg" },    // Buff Meat
    "527.1": { min: 240, max: 270, rep: 255, unit: "kg" },    // Live Broiler (Farmgate)
    "528.1": { min: 620, max: 700, rep: 660, unit: "kg" },    // Live Khasi (Farmgate)
    "522":   { min: 440, max: 480, rep: 460, unit: "crate" }, // Egg Crate (30 pcs)
  };

  for (const market of markets) {
    for (const [code, rate] of Object.entries(meatRates)) {
      const commId = commMap.get(code);
      if (!commId) continue;

      await db
        .insert(schema.canonicalDailyMarketPrices)
        .values({
          marketId: market.id,
          ampisCommodityId: commId,
          dateAd: dateAdStr,
          bsYear: 2083,
          bsMonth: 6,
          bsDay: 6,
          minPrice: rate.min.toFixed(2),
          maxPrice: rate.max.toFixed(2),
          representativePrice: rate.rep.toFixed(2),
          priceMeasureType: "ARITHMETIC_MEAN",
          canonicalUnit: rate.unit,
          version: 1,
          isCurrent: true,
          sourceObservationId: obsId,
        })
        .onConflictDoNothing();
    }
  }

  console.log("\n✅ Meat & Livestock Seeding Successfully Completed!");
}

seedMeatAndLivestock().catch(console.error);