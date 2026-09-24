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

async function seedGrainsAndDairy() {
  console.log("🌾 Seeding Cereals, Grains & Dairy Products into KrishiLens...\n");

  // ============================================================================
  // 1. SEED COMMODITIES INTO ampis_commodities
  // ============================================================================
  console.log("📦 1. Adding Grains and Dairy commodities...");

  const newCommodities = [
    // --- खाद्यान्न बाली (Cereals & Grains) ---
    { code: "601.1", nameEn: "Paddy (Coarse / Mota)", nameNe: "धान (मोटा)", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "601.2", nameEn: "Paddy (Medium / Mansuli)", nameNe: "धान (मध्यम/मन्सुली)", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "601.3", nameEn: "Paddy (Fine / Basmati)", nameNe: "धान (बासमती)", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "602",   nameEn: "Wheat Grain (Gahoon)", nameNe: "गहुँ", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "603",   nameEn: "Maize Grain (Makai)", nameNe: "मकै", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "604",   nameEn: "Finger Millet (Kodo)", nameNe: "कोदो", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "605",   nameEn: "Buckwheat (Phapar)", nameNe: "फापर", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "606",   nameEn: "Barley / Oats (Jau/Oat)", nameNe: "जौ / ओट", categoryEn: "Cereals", categoryNe: "खाद्यान्न बाली", canonicalUnit: "kg", isPriorityTier1: true },

    // --- दुग्धजन्य (Dairy Products) ---
    { code: "507",   nameEn: "Cow Milk (Raw)", nameNe: "गाईको दुध", categoryEn: "Dairy", categoryNe: "दुग्धजन्य", canonicalUnit: "litre", isPriorityTier1: true },
    { code: "389",   nameEn: "Buffalo Milk (Raw)", nameNe: "भैँसीको दुध", categoryEn: "Dairy", categoryNe: "दुग्धजन्य", canonicalUnit: "litre", isPriorityTier1: true },
    { code: "449",   nameEn: "Paneer (Fresh)", nameNe: "पनीर", categoryEn: "Dairy", categoryNe: "दुग्धजन्य", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "460",   nameEn: "Pure Ghee (Ghyu)", nameNe: "घ्यु", categoryEn: "Dairy", categoryNe: "दुग्धजन्य", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "459",   nameEn: "Hard Cheese (Chhurpi)", nameNe: "छुर्पी", categoryEn: "Dairy", categoryNe: "दुग्धजन्य", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "530",   nameEn: "Butter (Makhan)", nameNe: "मखन", categoryEn: "Dairy", categoryNe: "दुग्धजन्य", canonicalUnit: "kg", isPriorityTier1: true },
  ];

  await db.insert(schema.ampisCommodities).values(newCommodities).onConflictDoNothing();
  const allComms = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allComms.map((c) => [c.code, c.id]));
  console.log(`✓ Confirmed ${allComms.length} total commodities in database.`);

  // ============================================================================
  // 2. SEED CANONICAL CROPS & CROP CALENDARS FOR GRAINS (For Decision Engine)
  // ============================================================================
  console.log("\n🌱 2. Adding Agronomic Calendars for Paddy, Wheat, Maize, and Millet...");

  const grainCrops = [
    { slug: "paddy", nameEn: "Paddy (Rice)", nameNe: "धान", botanicalName: "Oryza sativa", baseWaterRequirement: "HIGH_IRRIGATED" as const },
    { slug: "wheat", nameEn: "Wheat", nameNe: "गहुँ", botanicalName: "Triticum aestivum", baseWaterRequirement: "MODERATE" as const },
    { slug: "maize", nameEn: "Maize (Corn)", nameNe: "मकै", botanicalName: "Zea mays", baseWaterRequirement: "MODERATE" as const },
    { slug: "millet", nameEn: "Finger Millet", nameNe: "कोदो", botanicalName: "Eleusine coracana", baseWaterRequirement: "LOW_RAINFED" as const },
  ];
  await db.insert(schema.canonicalCrops).values(grainCrops).onConflictDoNothing();

  const refreshedCrops = await db.select().from(schema.canonicalCrops);
  const cropMap = new Map(refreshedCrops.map((c) => [c.slug, c.id]));

  // Varieties
  const grainVarieties = [
    { cropId: cropMap.get("paddy")!, slug: "paddy-mansuli-terai", nameEn: "Mansuli Paddy (Terai)", nameNe: "मन्सुली धान (तराई)", maturityDaysMin: 120, maturityDaysMax: 135 },
    { cropId: cropMap.get("wheat")!, slug: "wheat-gautam-terai", nameEn: "Gautam Wheat (Terai)", nameNe: "गौतम गहुँ (तराई)", maturityDaysMin: 110, maturityDaysMax: 125 },
    { cropId: cropMap.get("maize")!, slug: "maize-deuti-hills", nameEn: "Deuti Maize (Mid-Hills)", nameNe: "देउती मकै (मध्यपहाड)", maturityDaysMin: 105, maturityDaysMax: 120 },
    { cropId: cropMap.get("millet")!, slug: "millet-dalle-hills", nameEn: "Dalle Kodo (Mid-Hills)", nameNe: "डल्ले कोदो (मध्यपहाड)", maturityDaysMin: 115, maturityDaysMax: 130 },
  ];
  await db.insert(schema.cropVarieties).values(grainVarieties).onConflictDoNothing();

  const refreshedVars = await db.select().from(schema.cropVarieties);
  const varMap = new Map(refreshedVars.map((v) => [v.slug, v.id]));

  // Link Varieties to AMPIS Commodities
  const grainSystems = [
    { varietyId: varMap.get("paddy-mansuli-terai")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("601.2")! },
    { varietyId: varMap.get("wheat-gautam-terai")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("602")! },
    { varietyId: varMap.get("maize-deuti-hills")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("603")! },
    { varietyId: varMap.get("millet-dalle-hills")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("604")! },
  ];
  await db.insert(schema.cropVarietySystems).values(grainSystems).onConflictDoNothing();

  const allSystems = await db.select().from(schema.cropVarietySystems);
  const sysMap = new Map(allSystems.map((s) => [s.varietyId, s.id]));

  // Official AITC Calendars
  const grainCalendars = [
    // Paddy in Terai: Sowing in Jestha-Ashad (Months 2–3), Harvest in Kartik-Mangsir (Months 7–8)
    { varietySystemId: sysMap.get(varMap.get("paddy-mansuli-terai")!)!, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 800, sowBsOptimalStartMonth: 2, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 3, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Wheat in Terai: Sowing in Kartik-Mangsir (Months 7–8), Harvest in Chaitra-Baisakh (Months 12–1)
    { varietySystemId: sysMap.get(varMap.get("wheat-gautam-terai")!)!, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 800, sowBsOptimalStartMonth: 7, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 8, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Maize in Mid-Hills: Sowing in Falgun-Chaitra (Months 11–12), Harvest in Asar-Shrawan (Months 3–4)
    { varietySystemId: sysMap.get(varMap.get("maize-deuti-hills")!)!, agroZone: "MID_HILLS" as const, altitudeMinMeters: 800, altitudeMaxMeters: 1800, sowBsOptimalStartMonth: 11, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 12, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Finger Millet in Mid-Hills (Rainfed): Sowing in Ashad (Month 3), Harvest in Kartik (Month 7)
    { varietySystemId: sysMap.get(varMap.get("millet-dalle-hills")!)!, agroZone: "MID_HILLS" as const, altitudeMinMeters: 700, altitudeMaxMeters: 2000, sowBsOptimalStartMonth: 3, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 3, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
  ];
  await db.insert(schema.cropCalendars).values(grainCalendars).onConflictDoNothing();

  // ============================================================================
  // 3. SEED REALISTIC DAILY WHOLESALE PRICES FOR GRAINS & DAIRY ACROSS MARKETS
  // ============================================================================
  console.log("\n🥛 3. Adding Active Daily Prices for Grains & Dairy...");

  const markets = await db.select().from(schema.markets);
  const firstObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = firstObs[0]?.id || 1;

  const today = new Date();
  const dateAdStr = today.toISOString().split("T")[0];

  // Base rates in NPR
  const grainAndDairyRates: Record<string, { min: number; max: number; rep: number; unit: string }> = {
    // Grains (per kg)
    "601.1": { min: 32.0, max: 35.0, rep: 33.5, unit: "kg" },    // Mota Dhan (Govt MSP is ~Rs. 31-34)
    "601.2": { min: 35.0, max: 38.0, rep: 36.5, unit: "kg" },    // Mansuli Dhan
    "601.3": { min: 65.0, max: 75.0, rep: 70.0, unit: "kg" },    // Basmati
    "602":   { min: 36.0, max: 40.0, rep: 38.0, unit: "kg" },    // Wheat (Govt MSP is ~Rs. 36)
    "603":   { min: 32.0, max: 38.0, rep: 35.0, unit: "kg" },    // Maize
    "604":   { min: 60.0, max: 75.0, rep: 68.0, unit: "kg" },    // Kodo (Millet)
    "605":   { min: 90.0, max: 110.0, rep: 100.0, unit: "kg" },  // Phapar (Buckwheat)
    "606":   { min: 70.0, max: 85.0, rep: 78.0, unit: "kg" },    // Jau / Oats

    // Dairy (per litre or per kg)
    "507":   { min: 65.0, max: 75.0, rep: 70.0, unit: "litre" }, // Cow Milk (per litre)
    "389":   { min: 85.0, max: 95.0, rep: 90.0, unit: "litre" }, // Buffalo Milk (per litre)
    "449":   { min: 680.0, max: 750.0, rep: 710.0, unit: "kg" },// Paneer (per kg)
    "460":   { min: 1100.0, max: 1300.0, rep: 1200.0, unit: "kg" }, // Pure Ghee (per kg)
    "459":   { min: 1200.0, max: 1450.0, rep: 1350.0, unit: "kg" }, // Chhurpi (per kg)
    "530":   { min: 850.0, max: 950.0, rep: 900.0, unit: "kg" }, // Makhan/Butter (per kg)
  };

  for (const market of markets) {
    for (const [code, rate] of Object.entries(grainAndDairyRates)) {
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

  console.log("\n✅ Grains & Dairy Master Seeding Successfully Completed!");
}

seedGrainsAndDairy().catch(console.error);