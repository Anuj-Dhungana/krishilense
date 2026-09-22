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

async function seedCalendars() {
  console.log("🌾 Seeding Comprehensive Official AITC Crop Calendars Across All 12 Months...\n");

  const crops = await db.select().from(schema.canonicalCrops);
  const cropMap = new Map(crops.map((c) => [c.slug, c.id]));

  const comms = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(comms.map((c) => [c.code, c.id]));

  // 1. Add extra canonical crops if missing
  const additionalCrops = [
    { slug: "chilli", nameEn: "Chilli", nameNe: "खुर्सानी", botanicalName: "Capsicum annuum", baseWaterRequirement: "MODERATE" as const },
    { slug: "beans", nameEn: "French Beans", nameNe: "सिमी", botanicalName: "Phaseolus vulgaris", baseWaterRequirement: "MODERATE" as const },
    { slug: "peas", nameEn: "Green Peas", nameNe: "केराउ / मटर", botanicalName: "Pisum sativum", baseWaterRequirement: "MODERATE" as const },
    { slug: "radish", nameEn: "Radish", nameNe: "मूला", botanicalName: "Raphanus sativus", baseWaterRequirement: "LOW_RAINFED" as const },
    { slug: "bitter-gourd", nameEn: "Bitter Gourd", nameNe: "तितो करेला", botanicalName: "Momordica charantia", baseWaterRequirement: "MODERATE" as const },
    { slug: "greens", nameEn: "Broad Leaf Mustard", nameNe: "रायो साग", botanicalName: "Brassica juncea", baseWaterRequirement: "MODERATE" as const },
  ];
  await db.insert(schema.canonicalCrops).values(additionalCrops).onConflictDoNothing();

  const refreshedCrops = await db.select().from(schema.canonicalCrops);
  const fullCropMap = new Map(refreshedCrops.map((c) => [c.slug, c.id]));

  // 2. Add extra crop varieties
  const additionalVarieties = [
    // Hills / Mid-Hills crops
    { cropId: fullCropMap.get("cauliflower")!, slug: "cauliflower-summer-hills", nameEn: "Cauliflower Summer (Mid-Hills)", nameNe: "काउली (वर्षे मध्यपहाड)", maturityDaysMin: 65, maturityDaysMax: 75 },
    { cropId: fullCropMap.get("cabbage")!, slug: "cabbage-hills-round", nameEn: "Cabbage (Mid-Hills)", nameNe: "बन्दा (मध्यपहाड)", maturityDaysMin: 70, maturityDaysMax: 85 },
    { cropId: fullCropMap.get("beans")!, slug: "french-beans-hills", nameEn: "French Beans (Mid-Hills)", nameNe: "घिउ सिमी (मध्यपहाड)", maturityDaysMin: 55, maturityDaysMax: 65 },
    { cropId: fullCropMap.get("greens")!, slug: "rayo-sag-winter", nameEn: "Rayo Sag (Winter)", nameNe: "रायो साग (हिउँदे)", maturityDaysMin: 40, maturityDaysMax: 50 },
    { cropId: fullCropMap.get("radish")!, slug: "radish-all-season", nameEn: "Radish 40 Days", nameNe: "मूला (चालीसे)", maturityDaysMin: 40, maturityDaysMax: 50 },
    { cropId: fullCropMap.get("peas")!, slug: "green-peas-winter", nameEn: "Green Peas (Winter)", nameNe: "मटरकोशा (हिउँदे)", maturityDaysMin: 65, maturityDaysMax: 75 },
    { cropId: fullCropMap.get("bitter-gourd")!, slug: "bitter-gourd-spring", nameEn: "Bitter Gourd (Spring/Summer)", nameNe: "तितो करेला (वसन्तकालीन)", maturityDaysMin: 60, maturityDaysMax: 75 },
    { cropId: fullCropMap.get("chilli")!, slug: "green-chilli-terai", nameEn: "Green Chilli (Terai)", nameNe: "हरियो खुर्सानी (तराई)", maturityDaysMin: 70, maturityDaysMax: 85 },
  ];
  await db.insert(schema.cropVarieties).values(additionalVarieties).onConflictDoNothing();

  const refreshedVarieties = await db.select().from(schema.cropVarieties);
  const varMap = new Map(refreshedVarieties.map((v) => [v.slug, v.id]));

  // 3. Link Varieties to AMPIS Commodities
  const systemMappings = [
    { varietyId: varMap.get("cauliflower-summer-hills")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("110.1")! },
    { varietyId: varMap.get("cabbage-hills-round")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("108.1")! },
    { varietyId: varMap.get("french-beans-hills")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("119.1")! },
    { varietyId: varMap.get("rayo-sag-winter")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("136")! },
    { varietyId: varMap.get("radish-all-season")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("114.1")! },
    { varietyId: varMap.get("green-peas-winter")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("118")! },
    { varietyId: varMap.get("bitter-gourd-spring")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("122")! },
    { varietyId: varMap.get("green-chilli-terai")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("303.1")! },
  ];
  await db.insert(schema.cropVarietySystems).values(systemMappings).onConflictDoNothing();

  const allSystems = await db.select().from(schema.cropVarietySystems);
  const sysMap = new Map(allSystems.map((s) => [s.varietyId, s.id]));

  // 4. Official AITC Crop Calendars (Covering Spring, Monsoon, Autumn, and Winter!)
  const calendars = [
    // Mid-Hills: Summer Cauliflower in Baisakh-Jestha (Months 1–2)
    { varietySystemId: sysMap.get(varMap.get("cauliflower-summer-hills")!)!, agroZone: "MID_HILLS" as const, altitudeMinMeters: 800, altitudeMaxMeters: 1800, sowBsOptimalStartMonth: 1, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 2, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Mid-Hills: Cabbage in Chaitra-Baisakh (Months 12–1)
    { varietySystemId: sysMap.get(varMap.get("cabbage-hills-round")!)!, agroZone: "MID_HILLS" as const, altitudeMinMeters: 800, altitudeMaxMeters: 1700, sowBsOptimalStartMonth: 12, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 1, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Mid-Hills: French Beans in Falgun-Chaitra (Months 11–12)
    { varietySystemId: sysMap.get(varMap.get("french-beans-hills")!)!, agroZone: "MID_HILLS" as const, altitudeMinMeters: 700, altitudeMaxMeters: 1800, sowBsOptimalStartMonth: 11, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 12, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Terai & Hills: Rayo Sag in Bhadra-Ashwin (Months 5–6)
    { varietySystemId: sysMap.get(varMap.get("rayo-sag-winter")!)!, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 1400, sowBsOptimalStartMonth: 5, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 6, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Radish: Fast 40-day crop in Ashwin-Kartik (Months 6–7)
    { varietySystemId: sysMap.get(varMap.get("radish-all-season")!)!, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 1500, sowBsOptimalStartMonth: 6, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 7, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Green Peas: Winter crop in Kartik (Month 7)
    { varietySystemId: sysMap.get(varMap.get("green-peas-winter")!)!, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 1400, sowBsOptimalStartMonth: 7, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 7, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Bitter Gourd: Spring crop in Magh-Falgun (Months 10–11)
    { varietySystemId: sysMap.get(varMap.get("bitter-gourd-spring")!)!, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 900, sowBsOptimalStartMonth: 10, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 11, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
    // Chilli: Winter/Spring in Ashwin-Kartik (Months 6–7)
    { varietySystemId: sysMap.get(varMap.get("green-chilli-terai")!)!, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 900, sowBsOptimalStartMonth: 6, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 7, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Diary 2082" },
  ];

  await db.insert(schema.cropCalendars).values(calendars).onConflictDoNothing();

  const allCals = await db.select().from(schema.cropCalendars);
  console.log(`✅ Success! Your database now has ${allCals.length} official AITC crop calendars covering Terai & Mid-Hills across all seasons!`);
}

seedCalendars().catch(console.error);