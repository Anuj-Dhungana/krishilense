import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting Master Data Seeding for KrishiLens Nepal...\n");

  // ============================================================================
  // 1. SEED PROVINCES (All 7 Provinces of Nepal)
  // ============================================================================
  console.log("📍 Seeding 7 Provinces of Nepal...");
  const provinceData = [
    { slug: "koshi", nameEn: "Koshi Province", nameNe: "कोशी प्रदेश" },
    { slug: "madhesh", nameEn: "Madhesh Province", nameNe: "मधेश प्रदेश" },
    { slug: "bagmati", nameEn: "Bagmati Province", nameNe: "बागमती प्रदेश" },
    { slug: "gandaki", nameEn: "Gandaki Province", nameNe: "गण्डकी प्रदेश" },
    { slug: "lumbini", nameEn: "Lumbini Province", nameNe: "लुम्बिनी प्रदेश" },
    { slug: "karnali", nameEn: "Karnali Province", nameNe: "कर्णाली प्रदेश" },
    { slug: "sudurpashchim", nameEn: "Sudurpashchim Province", nameNe: "सुदूरपश्चिम प्रदेश" },
  ];

  await db.insert(schema.provinces).values(provinceData).onConflictDoNothing();
  const allProvinces = await db.select().from(schema.provinces);
  const provMap = new Map(allProvinces.map((p) => [p.slug, p.id]));

  // ============================================================================
  // 2. SEED KEY ADMINISTRATIVE DISTRICTS
  // ============================================================================
  console.log("📍 Seeding Regional Hub Districts...");
  const districtData = [
    { provinceId: provMap.get("koshi")!, slug: "jhapa", nameEn: "Jhapa", nameNe: "झापा", defaultAgroZone: "TERAI" as const, averageElevationMeters: 120 },
    { provinceId: provMap.get("koshi")!, slug: "sunsari", nameEn: "Sunsari", nameNe: "सुनसरी", defaultAgroZone: "TERAI" as const, averageElevationMeters: 150 },
    { provinceId: provMap.get("madhesh")!, slug: "dhanusha", nameEn: "Dhanusha", nameNe: "धनुषा", defaultAgroZone: "TERAI" as const, averageElevationMeters: 90 },
    { provinceId: provMap.get("bagmati")!, slug: "kathmandu", nameEn: "Kathmandu", nameNe: "काठमाडौं", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 1350 },
    { provinceId: provMap.get("bagmati")!, slug: "kavrepalanchok", nameEn: "Kavrepalanchok", nameNe: "काभ्रेपलाञ्चोक", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 950 },
    { provinceId: provMap.get("gandaki")!, slug: "kaski", nameEn: "Kaski", nameNe: "कास्की", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 850 },
    { provinceId: provMap.get("lumbini")!, slug: "rupondehi", nameEn: "Rupandehi", nameNe: "रुपन्देही", defaultAgroZone: "TERAI" as const, averageElevationMeters: 105 },
    { provinceId: provMap.get("karnali")!, slug: "surkhet", nameEn: "Surkhet", nameNe: "सुर्खेत", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 650 },
    { provinceId: provMap.get("sudurpashchim")!, slug: "kailali", nameEn: "Kailali", nameNe: "कैलाली", defaultAgroZone: "TERAI" as const, averageElevationMeters: 110 },
  ];

  await db.insert(schema.administrativeDistricts).values(districtData).onConflictDoNothing();
  const allDistricts = await db.select().from(schema.administrativeDistricts);
  const distMap = new Map(allDistricts.map((d) => [d.slug, d.id]));

  // ============================================================================
  // 3. SEED MUNICIPALITIES
  // ============================================================================
  console.log("📍 Seeding Municipalities...");
  const municipalityData = [
    { districtId: distMap.get("kathmandu")!, slug: "kathmandu-metro", nameEn: "Kathmandu Metropolitan City", nameNe: "काठमाडौं महानगरपालिका", municipalityType: "METROPOLITAN" as const, elevationMeters: 1310 },
    { districtId: distMap.get("jhapa")!, slug: "birtamod-mun", nameEn: "Birtamod Municipality", nameNe: "बिर्तामोड नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 125 },
    { districtId: distMap.get("jhapa")!, slug: "shivasatakshi", nameEn: "Shivasatakshi Municipality", nameNe: "शिवसताक्षी नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 120 },
    { districtId: distMap.get("sunsari")!, slug: "dharan-submetro", nameEn: "Dharan Sub-Metropolitan City", nameNe: "धरान उपमहानगरपालिका", municipalityType: "SUB_METROPOLITAN" as const, elevationMeters: 350 },
    { districtId: distMap.get("dhanusha")!, slug: "mithila-mun", nameEn: "Mithila Municipality (Dhalkebar)", nameNe: "मिथिला नगरपालिका (ढल्केबर)", municipalityType: "MUNICIPALITY" as const, elevationMeters: 100 },
    { districtId: distMap.get("kaski")!, slug: "pokhara-metro", nameEn: "Pokhara Metropolitan City", nameNe: "पोखरा महानगरपालिका", municipalityType: "METROPOLITAN" as const, elevationMeters: 820 },
    { districtId: distMap.get("rupondehi")!, slug: "butwal-submetro", nameEn: "Butwal Sub-Metropolitan City", nameNe: "बुटवल उपमहानगरपालिका", municipalityType: "SUB_METROPOLITAN" as const, elevationMeters: 120 },
    { districtId: distMap.get("surkhet")!, slug: "birendranagar-mun", nameEn: "Birendranagar Municipality", nameNe: "वीरेन्द्रनगर नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 600 },
    { districtId: distMap.get("kailali")!, slug: "godawari-mun", nameEn: "Godawari Municipality (Attariya)", nameNe: "गोदावरी नगरपालिका (अत्तरिया)", municipalityType: "MUNICIPALITY" as const, elevationMeters: 130 },
    { districtId: distMap.get("kavrepalanchok")!, slug: "panchkhal-mun", nameEn: "Panchkhal Municipality", nameNe: "पाँचखाल नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 850 },
  ];

  await db.insert(schema.municipalities).values(municipalityData).onConflictDoNothing();
  const allMun = await db.select().from(schema.municipalities);
  const munMap = new Map(allMun.map((m) => [m.slug, m.id]));

  // ============================================================================
  // 4. SEED REGIONAL WHOLESALE MARKETS
  // ============================================================================
  console.log("🏪 Seeding 8 Regional Wholesale Markets...");
  const marketData = [
    { publicSlug: "kalimati", nameEn: "Kalimati Fruits & Vegetable Market", nameNe: "कालिमाटी फलफूल तथा तरकारी बजार", municipalityId: munMap.get("kathmandu-metro")!, elevationMeters: 1310, latitude: "27.698500", longitude: "85.301200", isFederalHub: true },
    { publicSlug: "birtamod", nameEn: "Birtamod Agriculture Wholesale Market", nameNe: "बिर्तामोड कृषि थोक बजार", municipalityId: munMap.get("birtamod-mun")!, elevationMeters: 125, latitude: "26.633300", longitude: "87.983300", isFederalHub: true },
    { publicSlug: "dharan", nameEn: "Dharan Agriculture Market Center", nameNe: "धरान कृषि बजार केन्द्र", municipalityId: munMap.get("dharan-submetro")!, elevationMeters: 350, latitude: "26.812400", longitude: "87.283500", isFederalHub: true },
    { publicSlug: "dhalkebar", nameEn: "Dhalkebar Agriculture Market", nameNe: "ढल्केबर कृषि बजार", municipalityId: munMap.get("mithila-mun")!, elevationMeters: 100, latitude: "26.960200", longitude: "85.968700", isFederalHub: true },
    { publicSlug: "pokhara", nameEn: "Pokhara Agriculture Produce Market", nameNe: "पोखरा कृषि उपज बजार", municipalityId: munMap.get("pokhara-metro")!, elevationMeters: 820, latitude: "28.209600", longitude: "83.985600", isFederalHub: true },
    { publicSlug: "butwal", nameEn: "Butwal Agriculture Wholesale Market", nameNe: "बुटवल कृषि थोक बजार", municipalityId: munMap.get("butwal-submetro")!, elevationMeters: 120, latitude: "27.700600", longitude: "83.448400", isFederalHub: true },
    { publicSlug: "birendranagar", nameEn: "Birendranagar Agriculture Wholesale Market", nameNe: "वीरेन्द्रनगर कृषि थोक बजार", municipalityId: munMap.get("birendranagar-mun")!, elevationMeters: 600, latitude: "28.601900", longitude: "81.633700", isFederalHub: true },
    { publicSlug: "attariya", nameEn: "Attariya Agriculture Wholesale Market", nameNe: "अत्तरिया कृषि थोक बजार", municipalityId: munMap.get("godawari-mun")!, elevationMeters: 130, latitude: "28.816700", longitude: "80.550000", isFederalHub: true },
  ];

  await db.insert(schema.markets).values(marketData).onConflictDoNothing();

  // ============================================================================
  // 5. SEED PRIORITY AMPIS COMMODITIES
  // ============================================================================
  console.log("🥕 Seeding Priority AMPIS Commodities...");
  const commodityData = [
    { code: "101.1", nameEn: "Tomato Big (Nepali)", nameNe: "गोलभेंडा ठुलो (नेपाली)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "102.1", nameEn: "Tomato Small (Local)", nameNe: "गोलभेंडा सानो (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "102.2", nameEn: "Tomato Small (Tunnel)", nameNe: "गोलभेंडा सानो (टनेल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "104.1", nameEn: "Potato Red (Long)", nameNe: "रातो आलु (लाम्चो)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "106.1", nameEn: "Onion Dry (Indian)", nameNe: "प्याज सुकेको (भारतीय)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "108.1", nameEn: "Cabbage (Local)", nameNe: "बन्दा (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "110.1", nameEn: "Cauliflower (Local)", nameNe: "काउली (स्थानीय)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "114.1", nameEn: "Radish White (Local)", nameNe: "मूला सेतो (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "115", nameEn: "Brinjal (Long)", nameNe: "भन्टा लाम्चो", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "119.1", nameEn: "French Beans (Local)", nameNe: "घिउ सिमी (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "122", nameEn: "Bitter Gourd", nameNe: "तितो करेला", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "212.1", nameEn: "Cucumber (Local)", nameNe: "काँक्रो (लोकल)", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "301", nameEn: "Ginger", nameNe: "अदुवा", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "303.1", nameEn: "Green Chilli (Long)", nameNe: "खुर्सानी हरियो (लाम्चो)", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
  ];

  await db.insert(schema.ampisCommodities).values(commodityData).onConflictDoNothing();
  const allComm = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(allComm.map((c) => [c.code, c.id]));

  // ============================================================================
  // 6. SEED CANONICAL CROPS, VARIETIES, SYSTEMS & CALENDARS
  // ============================================================================
  console.log("🌾 Seeding Agronomic Crops & Official AITC Calendars...");

  // Crops
  const cropData = [
    { slug: "tomato", nameEn: "Tomato", nameNe: "गोलभेंडा", botanicalName: "Solanum lycopersicum", baseWaterRequirement: "HIGH_IRRIGATED" as const },
    { slug: "potato", nameEn: "Potato", nameNe: "आलु", botanicalName: "Solanum tuberosum", baseWaterRequirement: "MODERATE" as const },
    { slug: "cauliflower", nameEn: "Cauliflower", nameNe: "काउली", botanicalName: "Brassica oleracea var. botrytis", baseWaterRequirement: "MODERATE" as const },
    { slug: "cabbage", nameEn: "Cabbage", nameNe: "बन्दा", botanicalName: "Brassica oleracea var. capitata", baseWaterRequirement: "MODERATE" as const },
    { slug: "cucumber", nameEn: "Cucumber", nameNe: "काँक्रो", botanicalName: "Cucumis sativus", baseWaterRequirement: "MODERATE" as const },
  ];

  await db.insert(schema.canonicalCrops).values(cropData).onConflictDoNothing();
  const allCrops = await db.select().from(schema.canonicalCrops);
  const cropMap = new Map(allCrops.map((c) => [c.slug, c.id]));

  // Varieties
  const varietyData = [
    { cropId: cropMap.get("cauliflower")!, slug: "cauliflower-local-winter", nameEn: "Cauliflower (Local Winter)", nameNe: "काउली (स्थानीय हिउँदे)", maturityDaysMin: 70, maturityDaysMax: 80 },
    { cropId: cropMap.get("tomato")!, slug: "tomato-hybrid-open", nameEn: "Tomato (Hybrid Open Field)", nameNe: "गोलभेंडा (उन्नत खुल्ला)", maturityDaysMin: 85, maturityDaysMax: 95 },
    { cropId: cropMap.get("tomato")!, slug: "tomato-srijana-tunnel", nameEn: "Tomato Srijana (Tunnel)", nameNe: "गोलभेंडा सृजना (टनेल)", maturityDaysMin: 80, maturityDaysMax: 90 },
    { cropId: cropMap.get("potato")!, slug: "potato-red-terai", nameEn: "Red Potato (Terai Winter)", nameNe: "रातो आलु (तराई हिउँदे)", maturityDaysMin: 90, maturityDaysMax: 105 },
    { cropId: cropMap.get("cucumber")!, slug: "cucumber-spring", nameEn: "Cucumber (Spring Field)", nameNe: "काँक्रो (वसन्तकालीन)", maturityDaysMin: 50, maturityDaysMax: 60 },
  ];

  await db.insert(schema.cropVarieties).values(varietyData).onConflictDoNothing();
  const allVarieties = await db.select().from(schema.cropVarieties);
  const varMap = new Map(allVarieties.map((v) => [v.slug, v.id]));

  // Variety Systems (Connecting to AMPIS Commodity codes)
  const systemData = [
    { varietyId: varMap.get("cauliflower-local-winter")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("110.1")! },
    { varietyId: varMap.get("tomato-hybrid-open")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("101.1")! },
    { varietyId: varMap.get("tomato-srijana-tunnel")!, productionSystem: "PLASTIC_TUNNEL" as const, ampisCommodityId: commMap.get("102.2")! },
    { varietyId: varMap.get("potato-red-terai")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("104.1")! },
    { varietyId: varMap.get("cucumber-spring")!, productionSystem: "OPEN_FIELD" as const, ampisCommodityId: commMap.get("212.1")! },
  ];

  await db.insert(schema.cropVarietySystems).values(systemData).onConflictDoNothing();
  const allSystems = await db.select().from(schema.cropVarietySystems);

  // Calendars (AITC Baseline Sowing Windows in BS)
  const calendarData = [
    // Cauliflower Local in Terai: Sowing in Ashwin (Month 6)
    { varietySystemId: allSystems[0].id, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 700, sowBsOptimalStartMonth: 6, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 6, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Krishi Diary 2082/2083" },
    // Tomato Open Field in Terai: Sowing in Ashwin (Month 6)
    { varietySystemId: allSystems[1].id, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 800, sowBsOptimalStartMonth: 5, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 6, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Krishi Diary 2082/2083" },
    // Tomato Srijana Tunnel in Mid-Hills: Sowing in Falgun (Month 11)
    { varietySystemId: allSystems[2].id, agroZone: "MID_HILLS" as const, altitudeMinMeters: 800, altitudeMaxMeters: 1700, sowBsOptimalStartMonth: 11, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 12, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Krishi Diary 2082/2083" },
    // Potato Red in Terai: Sowing in Kartik (Month 7)
    { varietySystemId: allSystems[3].id, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 600, sowBsOptimalStartMonth: 7, sowBsOptimalStartDay: 1, sowBsOptimalEndMonth: 7, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Krishi Diary 2082/2083" },
    // Cucumber Spring in Terai: Sowing in Magh (Month 10)
    { varietySystemId: allSystems[4].id, agroZone: "TERAI" as const, altitudeMinMeters: 80, altitudeMaxMeters: 700, sowBsOptimalStartMonth: 10, sowBsOptimalStartDay: 15, sowBsOptimalEndMonth: 11, sowBsOptimalEndDay: 30, sowBsLateGraceDays: 15, referenceDocument: "AITC Krishi Diary 2082/2083" },
  ];

  await db.insert(schema.cropCalendars).values(calendarData).onConflictDoNothing();

  console.log("\n✅ Master Data Seeding Completed Successfully!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});