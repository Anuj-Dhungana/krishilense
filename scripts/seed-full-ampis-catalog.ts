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

async function seedFullCatalog() {
  console.log("🌾 Populating Full Multi-Market & Multi-Category AMPIS Catalog...\n");

  // ============================================================================
  // 1. ENSURE ALL 12 MARKETS EXIST
  // ============================================================================
  console.log("📍 Verifying All 12 Federal Wholesale Markets...");
  
  const allProvinces = await db.select().from(schema.provinces);
  const provMap = new Map(allProvinces.map((p) => [p.slug, p.id]));

  // Ensure all 12 districts exist
  const districts = [
    { provinceId: provMap.get("koshi")!, slug: "jhapa", nameEn: "Jhapa", nameNe: "झापा", defaultAgroZone: "TERAI" as const, averageElevationMeters: 120 },
    { provinceId: provMap.get("koshi")!, slug: "sunsari", nameEn: "Sunsari", nameNe: "सुनसरी", defaultAgroZone: "TERAI" as const, averageElevationMeters: 150 },
    { provinceId: provMap.get("madhesh")!, slug: "dhanusha", nameEn: "Dhanusha", nameNe: "धनुषा", defaultAgroZone: "TERAI" as const, averageElevationMeters: 90 },
    { provinceId: provMap.get("madhesh")!, slug: "sarlahi", nameEn: "Sarlahi", nameNe: "सर्लाही", defaultAgroZone: "TERAI" as const, averageElevationMeters: 95 },
    { provinceId: provMap.get("bagmati")!, slug: "kathmandu", nameEn: "Kathmandu", nameNe: "काठमाडौं", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 1350 },
    { provinceId: provMap.get("bagmati")!, slug: "sindhuli", nameEn: "Sindhuli", nameNe: "सिन्धुली", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 1100 },
    { provinceId: provMap.get("gandaki")!, slug: "kaski", nameEn: "Kaski", nameNe: "कास्की", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 850 },
    { provinceId: provMap.get("gandaki")!, slug: "nawalpur", nameEn: "Nawalpur", nameNe: "नवलपुर", defaultAgroZone: "TERAI" as const, averageElevationMeters: 180 },
    { provinceId: provMap.get("lumbini")!, slug: "rupondehi", nameEn: "Rupandehi", nameNe: "रुपन्देही", defaultAgroZone: "TERAI" as const, averageElevationMeters: 105 },
    { provinceId: provMap.get("lumbini")!, slug: "banke", nameEn: "Banke", nameNe: "बाँके", defaultAgroZone: "TERAI" as const, averageElevationMeters: 140 },
    { provinceId: provMap.get("karnali")!, slug: "surkhet", nameEn: "Surkhet", nameNe: "सुर्खेत", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 650 },
    { provinceId: provMap.get("sudurpashchim")!, slug: "kailali", nameEn: "Kailali", nameNe: "कैलाली", defaultAgroZone: "TERAI" as const, averageElevationMeters: 110 },
  ];
  await db.insert(schema.administrativeDistricts).values(districts).onConflictDoNothing();

  const allDistricts = await db.select().from(schema.administrativeDistricts);
  const distMap = new Map(allDistricts.map((d) => [d.slug, d.id]));

  // Ensure municipalities exist
  const municipalities = [
    { districtId: distMap.get("kathmandu")!, slug: "kathmandu-metro", nameEn: "Kathmandu", nameNe: "काठमाडौं", municipalityType: "METROPOLITAN" as const, elevationMeters: 1310 },
    { districtId: distMap.get("jhapa")!, slug: "birtamod-mun", nameEn: "Birtamod", nameNe: "बिर्तामोड", municipalityType: "MUNICIPALITY" as const, elevationMeters: 125 },
    { districtId: distMap.get("sunsari")!, slug: "dharan-submetro", nameEn: "Dharan", nameNe: "धरान", municipalityType: "SUB_METROPOLITAN" as const, elevationMeters: 350 },
    { districtId: distMap.get("dhanusha")!, slug: "mithila-mun", nameEn: "Mithila (Dhalkebar)", nameNe: "मिथिला (ढल्केबर)", municipalityType: "MUNICIPALITY" as const, elevationMeters: 100 },
    { districtId: distMap.get("sarlahi")!, slug: "lalbandi-mun", nameEn: "Lalbandi", nameNe: "लालबन्दी", municipalityType: "MUNICIPALITY" as const, elevationMeters: 120 },
    { districtId: distMap.get("sindhuli")!, slug: "kamalamai-mun", nameEn: "Kamalamai", nameNe: "कमलामाई", municipalityType: "MUNICIPALITY" as const, elevationMeters: 1100 },
    { districtId: distMap.get("kaski")!, slug: "pokhara-metro", nameEn: "Pokhara", nameNe: "पोखरा", municipalityType: "METROPOLITAN" as const, elevationMeters: 820 },
    { districtId: distMap.get("nawalpur")!, slug: "kawasoti-mun", nameEn: "Kawasoti", nameNe: "कावासोती", municipalityType: "MUNICIPALITY" as const, elevationMeters: 180 },
    { districtId: distMap.get("rupondehi")!, slug: "butwal-submetro", nameEn: "Butwal", nameNe: "बुटवल", municipalityType: "SUB_METROPOLITAN" as const, elevationMeters: 120 },
    { districtId: distMap.get("banke")!, slug: "kohalpur-mun", nameEn: "Kohalpur", nameNe: "कोहलपुर", municipalityType: "MUNICIPALITY" as const, elevationMeters: 145 },
    { districtId: distMap.get("surkhet")!, slug: "birendranagar-mun", nameEn: "Birendranagar", nameNe: "वीरेन्द्रनगर", municipalityType: "MUNICIPALITY" as const, elevationMeters: 600 },
    { districtId: distMap.get("kailali")!, slug: "godawari-mun", nameEn: "Godawari (Attariya)", nameNe: "गोदावरी (अत्तरिया)", municipalityType: "MUNICIPALITY" as const, elevationMeters: 130 },
  ];
  await db.insert(schema.municipalities).values(municipalities).onConflictDoNothing();

  const allMun = await db.select().from(schema.municipalities);
  const munMap = new Map(allMun.map((m) => [m.slug, m.id]));

  // Ensure all 12 wholesale markets exist
  const markets = [
    { publicSlug: "kalimati", nameEn: "Kalimati Wholesale Market", nameNe: "कालिमाटी फलफूल तथा तरकारी बजार", municipalityId: munMap.get("kathmandu-metro")!, elevationMeters: 1310, latitude: "27.698500", longitude: "85.301200", isFederalHub: true },
    { publicSlug: "birtamod", nameEn: "Birtamod Wholesale Market", nameNe: "बिर्तामोड कृषि थोक बजार", municipalityId: munMap.get("birtamod-mun")!, elevationMeters: 125, latitude: "26.633300", longitude: "87.983300", isFederalHub: true },
    { publicSlug: "dharan", nameEn: "Dharan Agriculture Market Center", nameNe: "धरान कृषि बजार केन्द्र", municipalityId: munMap.get("dharan-submetro")!, elevationMeters: 350, latitude: "26.812400", longitude: "87.283500", isFederalHub: true },
    { publicSlug: "dhalkebar", nameEn: "Dhalkebar Agriculture Market", nameNe: "ढल्केबर कृषि बजार", municipalityId: munMap.get("mithila-mun")!, elevationMeters: 100, latitude: "26.960200", longitude: "85.968700", isFederalHub: true },
    { publicSlug: "lalbandi", nameEn: "Lalbandi Agriculture Market", nameNe: "लालबन्दी कृषि बजार", municipalityId: munMap.get("lalbandi-mun")!, elevationMeters: 120, latitude: "27.050000", longitude: "85.550000", isFederalHub: true },
    { publicSlug: "kamalamai", nameEn: "Kamalamai Agriculture Market", nameNe: "कमलामाई कृषि बजार", municipalityId: munMap.get("kamalamai-mun")!, elevationMeters: 1100, latitude: "27.250000", longitude: "85.916700", isFederalHub: true },
    { publicSlug: "pokhara", nameEn: "Pokhara Produce Market", nameNe: "पोखरा कृषि उपज बजार", municipalityId: munMap.get("pokhara-metro")!, elevationMeters: 820, latitude: "28.209600", longitude: "83.985600", isFederalHub: true },
    { publicSlug: "kawasoti", nameEn: "Kawasoti Agriculture Market", nameNe: "कावासोती कृषि बजार", municipalityId: munMap.get("kawasoti-mun")!, elevationMeters: 180, latitude: "27.650000", longitude: "84.133300", isFederalHub: true },
    { publicSlug: "butwal", nameEn: "Butwal Wholesale Market", nameNe: "बुटवल कृषि थोक बजार", municipalityId: munMap.get("butwal-submetro")!, elevationMeters: 120, latitude: "27.700600", longitude: "83.448400", isFederalHub: true },
    { publicSlug: "kohalpur", nameEn: "Kohalpur Agriculture Market", nameNe: "कोहलपुर कृषि बजार", municipalityId: munMap.get("kohalpur-mun")!, elevationMeters: 145, latitude: "28.183300", longitude: "81.716700", isFederalHub: true },
    { publicSlug: "birendranagar", nameEn: "Birendranagar Wholesale Market", nameNe: "वीरेन्द्रनगर कृषि थोक बजार", municipalityId: munMap.get("birendranagar-mun")!, elevationMeters: 600, latitude: "28.601900", longitude: "81.633700", isFederalHub: true },
    { publicSlug: "attariya", nameEn: "Attariya Wholesale Market", nameNe: "अत्तरिया कृषि थोक बजार", municipalityId: munMap.get("godawari-mun")!, elevationMeters: 130, latitude: "28.816700", longitude: "80.550000", isFederalHub: true },
  ];
  await db.insert(schema.markets).values(markets).onConflictDoNothing();

  const currentMarkets = await db.select().from(schema.markets);
  console.log(`✓ Confirmed ${currentMarkets.length} federal wholesale markets in Neon.`);

  // ============================================================================
  // 2. SEED OFFICIAL COMMODITIES ACROSS ALL 11 CATEGORIES
  // ============================================================================
  console.log("\n📦 Seeding 50+ Commodities Across All 11 Categories...");

  const allCommodityData = [
    // 1. तरकारी (Vegetables)
    { code: "101.1", nameEn: "Tomato Big (Nepali)", nameNe: "गोलभेंडा ठुलो (नेपाली)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "102.1", nameEn: "Tomato Small (Local)", nameNe: "गोलभेंडा सानो (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "102.2", nameEn: "Tomato Small (Tunnel)", nameNe: "गोलभेंडा सानो (टनेल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "106.1", nameEn: "Onion Dry (Indian)", nameNe: "प्याज सुकेको (भारतीय)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "107.1", nameEn: "Carrot (Local)", nameNe: "गाँजर (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "108.1", nameEn: "Cabbage (Local)", nameNe: "बन्दा (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "110.1", nameEn: "Cauliflower (Local)", nameNe: "काउली (स्थानीय)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "114.1", nameEn: "Radish White (Local)", nameNe: "मूला सेतो (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "115", nameEn: "Brinjal (Long)", nameNe: "भन्टा लाम्चो", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "116", nameEn: "Brinjal (Round)", nameNe: "भन्टा डल्लो", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "122", nameEn: "Bitter Gourd", nameNe: "तितो करेला", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "123", nameEn: "Bottle Gourd", nameNe: "लौका", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "124.1", nameEn: "Pointed Gourd (Parwar)", nameNe: "परवर (लोकल)", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "126", nameEn: "Sponge Gourd (Ghiroonla)", nameNe: "घिरौंला", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "128", nameEn: "Pumpkin Ripe", nameNe: "फर्सी पाकेको", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "131", nameEn: "Okra (Bhindi)", nameNe: "भिण्डी", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "135", nameEn: "Chayote (Ishkus)", nameNe: "स्कूस", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "147", nameEn: "Broccoli", nameNe: "ब्रोकाउली", categoryEn: "Vegetables", categoryNe: "तरकारी", canonicalUnit: "kg", isPriorityTier1: true },

    // 2. कन्दमुल बाली (Tubers / Root Crops)
    { code: "104.1", nameEn: "Potato Red (Long)", nameNe: "रातो आलु (लाम्चो)", categoryEn: "Tubers", categoryNe: "कन्दमुल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "104.3", nameEn: "Potato Red (Mudhe)", nameNe: "आलु रातो (मुढे)", categoryEn: "Tubers", categoryNe: "कन्दमुल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "105", nameEn: "Potato White", nameNe: "आलु सेतो", categoryEn: "Tubers", categoryNe: "कन्दमुल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "132", nameEn: "Sweet Potato", nameNe: "सखरखण्ड", categoryEn: "Tubers", categoryNe: "कन्दमुल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "134", nameEn: "Taro Root (Pindalu)", nameNe: "पिंडालु", categoryEn: "Tubers", categoryNe: "कन्दमुल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "143", nameEn: "Yam (Tarul)", nameNe: "तरुल", categoryEn: "Tubers", categoryNe: "कन्दमुल बाली", canonicalUnit: "kg", isPriorityTier1: true },

    // 3. फलफूल (Fruits)
    { code: "201.1", nameEn: "Apple (Jhole)", nameNe: "स्याउ (झोले)", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "201.3", nameEn: "Apple (Mustang)", nameNe: "स्याउ (मुस्ताङ्ग)", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "202.1", nameEn: "Banana (Jhapali)", nameNe: "केरा (झापाली)", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "dozen", isPriorityTier1: true },
    { code: "202.2", nameEn: "Banana (Malbhog)", nameNe: "केरा (मालभोग)", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "dozen", isPriorityTier1: true },
    { code: "203", nameEn: "Lemon / Lime (Kagati)", nameNe: "कागती", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "204.1", nameEn: "Pineapple", nameNe: "भुई कटहर", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "piece", isPriorityTier1: true },
    { code: "205", nameEn: "Papaya (Mewa)", nameNe: "मेवा", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "206", nameEn: "Orange (Nepali)", nameNe: "सुन्तला (नेपाली)", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "207", nameEn: "Watermelon", nameNe: "तरबुजा", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "212.1", nameEn: "Cucumber (Local)", nameNe: "काँक्रो (लोकल)", categoryEn: "Fruits", categoryNe: "फलफूल", canonicalUnit: "kg", isPriorityTier1: true },

    // 4. मसला बाली (Spices)
    { code: "301", nameEn: "Ginger (Aduwa)", nameNe: "अदुवा", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "302.1", nameEn: "Garlic Dry (Nepali)", nameNe: "लसुन सुकेको (नेपाली)", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "302.2", nameEn: "Garlic Dry (Chinese)", nameNe: "लसुन सुकेको (चाईनिज)", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "303.1", nameEn: "Green Chilli (Long)", nameNe: "खुर्सानी हरियो (लाम्चो)", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "303.4", nameEn: "Chilli Akabare (Dalle)", nameNe: "खुर्सानी हरियो (अकबरे)", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "304", nameEn: "Dry Red Chilli", nameNe: "खुर्सानी सुकेको", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "305", nameEn: "Green Coriander", nameNe: "धनियाँ हरियो", categoryEn: "Spices", categoryNe: "मसला बाली", canonicalUnit: "kg", isPriorityTier1: true },

    // 5. सागपात (Leafy Greens)
    { code: "136", nameEn: "Mustard Greens (Rayo)", nameNe: "रायो साग", categoryEn: "Leafy Greens", categoryNe: "सागपात", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "137", nameEn: "Spinach (Palungo)", nameNe: "पालुंगो साग", categoryEn: "Leafy Greens", categoryNe: "सागपात", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "138", nameEn: "Cress Greens (Chamsur)", nameNe: "चम्सुरको साग", categoryEn: "Leafy Greens", categoryNe: "सागपात", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "139", nameEn: "Mustard Green (Tori)", nameNe: "तोरीको साग", categoryEn: "Leafy Greens", categoryNe: "सागपात", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "140", nameEn: "Fenugreek Leaves (Methi)", nameNe: "मेथीको साग", categoryEn: "Leafy Greens", categoryNe: "सागपात", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "141", nameEn: "Green Spring Onion", nameNe: "प्याज हरियो", categoryEn: "Leafy Greens", categoryNe: "सागपात", canonicalUnit: "kg", isPriorityTier1: true },

    // 6. च्याउ खेती (Mushrooms)
    { code: "144.1", nameEn: "Oyster Mushroom (Kanye)", nameNe: "च्याउ (कन्ये)", categoryEn: "Mushrooms", categoryNe: "च्याउ खेती", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "144.2", nameEn: "Button Mushroom (Dalle)", nameNe: "च्याउ (डल्ले)", categoryEn: "Mushrooms", categoryNe: "च्याउ खेती", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "144.3", nameEn: "King Oyster Mushroom", nameNe: "राजा च्याउ", categoryEn: "Mushrooms", categoryNe: "च्याउ खेती", canonicalUnit: "kg", isPriorityTier1: true },

    // 7. कोसे / दाल बाली (Legumes / Pulses)
    { code: "117.1", nameEn: "Cowpea (Bodi Tane)", nameNe: "बोडी (तने)", categoryEn: "Legumes", categoryNe: "कोसे / दाल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "118", nameEn: "Green Peas (Matarkosha)", nameNe: "मटरकोशा", categoryEn: "Legumes", categoryNe: "कोसे / दाल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "119.1", nameEn: "French Beans (Local)", nameNe: "घिउ सिमी (लोकल)", categoryEn: "Legumes", categoryNe: "कोसे / दाल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "120", nameEn: "Climbing Bean (Tate Simi)", nameNe: "टाटे सिमी", categoryEn: "Legumes", categoryNe: "कोसे / दाल बाली", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "121", nameEn: "Soybean Green (Bhatmas)", nameNe: "भटमास", categoryEn: "Legumes", categoryNe: "कोसे / दाल बाली", canonicalUnit: "kg", isPriorityTier1: true },

    // 8. माछा (Fish)
    { code: "401", nameEn: "Rahu Fish", nameNe: "रहु माछा", categoryEn: "Fish", categoryNe: "माछा", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "402", nameEn: "Naini Fish", nameNe: "नैनी माछा", categoryEn: "Fish", categoryNe: "माछा", canonicalUnit: "kg", isPriorityTier1: true },
    { code: "403", nameEn: "Silver Carp", nameNe: "सिल्भर कार्प", categoryEn: "Fish", categoryNe: "माछा", canonicalUnit: "kg", isPriorityTier1: true },
  ];

  await db.insert(schema.ampisCommodities).values(allCommodityData).onConflictDoNothing();

  const allCommsInDb = await db.select().from(schema.ampisCommodities);
  console.log(`✓ Confirmed ${allCommsInDb.length} commodities across all categories in Neon.`);

  // ============================================================================
  // 3. GENERATE ACTIVE DAILY PRICES FOR ALL 12 MARKETS ACROSS ALL CATEGORIES
  // ============================================================================
  console.log("\n📊 Generating Active Daily Bulletins for All 12 Markets...");

  // Dummy observation ID for foreign key
  const firstObs = await db.select().from(schema.sourceObservations).limit(1);
  const obsId = firstObs[0]?.id || 1;

  const today = new Date();
  const dateAdStr = today.toISOString().split("T")[0];

  // Base wholesale benchmark prices in NPR
  const baselineRates: Record<string, { min: number; max: number; rep: number }> = {
    // Vegetables
    "101.1": { min: 45, max: 55, rep: 50.8 },
    "102.1": { min: 42, max: 50, rep: 46.5 },
    "102.2": { min: 48, max: 56, rep: 52.0 },
    "106.1": { min: 80, max: 90, rep: 85.0 },
    "107.1": { min: 50, max: 60, rep: 55.0 },
    "108.1": { min: 15, max: 22, rep: 18.5 },
    "110.1": { min: 75, max: 88, rep: 81.5 },
    "114.1": { min: 20, max: 26, rep: 23.0 },
    "115":   { min: 12, max: 18, rep: 15.0 },
    "116":   { min: 18, max: 25, rep: 21.5 },
    "122":   { min: 60, max: 72, rep: 66.0 },
    "123":   { min: 35, max: 45, rep: 40.0 },
    "124.1": { min: 55, max: 65, rep: 60.0 },
    "126":   { min: 40, max: 50, rep: 45.0 },
    "128":   { min: 25, max: 32, rep: 28.5 },
    "131":   { min: 65, max: 75, rep: 70.0 },
    "135":   { min: 20, max: 30, rep: 25.0 },
    "147":   { min: 90, max: 110, rep: 100.0 },

    // Tubers
    "104.1": { min: 32, max: 38, rep: 35.0 },
    "104.3": { min: 40, max: 48, rep: 44.0 },
    "105":   { min: 28, max: 34, rep: 31.0 },
    "132":   { min: 45, max: 55, rep: 50.0 },
    "134":   { min: 50, max: 62, rep: 56.0 },
    "143":   { min: 65, max: 80, rep: 72.5 },

    // Fruits
    "201.1": { min: 160, max: 190, rep: 175.0 },
    "201.3": { min: 210, max: 250, rep: 230.0 },
    "202.1": { min: 100, max: 120, rep: 110.0 },
    "202.2": { min: 130, max: 150, rep: 140.0 },
    "203":   { min: 140, max: 170, rep: 155.0 },
    "204.1": { min: 60, max: 80, rep: 70.0 },
    "205":   { min: 70, max: 90, rep: 80.0 },
    "206":   { min: 110, max: 130, rep: 120.0 },
    "207":   { min: 45, max: 60, rep: 52.5 },
    "212.1": { min: 35, max: 48, rep: 41.5 },

    // Spices
    "301":   { min: 150, max: 180, rep: 165.0 },
    "302.1": { min: 220, max: 260, rep: 240.0 },
    "302.2": { min: 190, max: 220, rep: 205.0 },
    "303.1": { min: 50, max: 65, rep: 57.5 },
    "303.4": { min: 180, max: 220, rep: 200.0 },
    "304":   { min: 260, max: 310, rep: 285.0 },
    "305":   { min: 80, max: 110, rep: 95.0 },

    // Leafy Greens
    "136":   { min: 30, max: 40, rep: 35.0 },
    "137":   { min: 65, max: 80, rep: 72.5 },
    "138":   { min: 70, max: 85, rep: 77.5 },
    "139":   { min: 25, max: 35, rep: 30.0 },
    "140":   { min: 75, max: 90, rep: 82.5 },
    "141":   { min: 50, max: 65, rep: 57.5 },

    // Mushrooms
    "144.1": { min: 110, max: 140, rep: 125.0 },
    "144.2": { min: 250, max: 300, rep: 275.0 },
    "144.3": { min: 320, max: 380, rep: 350.0 },

    // Legumes
    "117.1": { min: 55, max: 70, rep: 62.5 },
    "118":   { min: 80, max: 100, rep: 90.0 },
    "119.1": { min: 60, max: 75, rep: 67.5 },
    "120":   { min: 70, max: 85, rep: 77.5 },
    "121":   { min: 45, max: 55, rep: 50.0 },

    // Fish
    "401":   { min: 280, max: 320, rep: 300.0 },
    "402":   { min: 260, max: 300, rep: 280.0 },
    "403":   { min: 240, max: 280, rep: 260.0 },
  };

  // Regional market multiplier factors (Transport cost & local production differences)
  const marketMultipliers: Record<string, number> = {
    kalimati: 1.0,      // National benchmark (Kathmandu)
    pokhara: 1.08,      // Mid-Hills tourist city (+8% premium)
    birtamod: 0.88,     // Eastern Terai production hub (-12% farmgate discount)
    dharan: 0.92,       // Eastern foothills (-8%)
    dhalkebar: 0.86,    // Central Terai lowland (-14%)
    lalbandi: 0.84,     // Sarlahi vegetable hub (-16%)
    kamalamai: 1.04,    // Sindhuli inner-hills (+4%)
    kawasoti: 0.90,     // Nawalpur Terai (-10%)
    butwal: 0.92,       // Western Terai hub (-8%)
    kohalpur: 0.88,     // Banke production hub (-12%)
    birendranagar: 1.05,// Karnali transport corridor (+5%)
    attariya: 0.87,     // Far-Western Terai hub (-13%)
  };

  // Clear existing active prices to prevent duplication
  await db.delete(schema.canonicalDailyMarketPrices).where(eq(schema.canonicalDailyMarketPrices.dateAd, dateAdStr));

  let totalInserted = 0;

  for (const market of currentMarkets) {
    const factor = marketMultipliers[market.publicSlug] || 1.0;
    console.log(`  📍 Populating bulletin for ${market.nameNe} (Factor: ${factor})...`);

    for (const comm of allCommsInDb) {
      const rate = baselineRates[comm.code];
      if (!rate) continue;

      const minPrice = Number((rate.min * factor).toFixed(2));
      const maxPrice = Number((rate.max * factor).toFixed(2));
      const repPrice = Number((rate.rep * factor).toFixed(2));

      await db
        .insert(schema.canonicalDailyMarketPrices)
        .values({
          marketId: market.id,
          ampisCommodityId: comm.id,
          dateAd: dateAdStr,
          bsYear: 2083,
          bsMonth: 6,
          bsDay: 6,
          minPrice: minPrice.toFixed(2),
          maxPrice: maxPrice.toFixed(2),
          representativePrice: repPrice.toFixed(2),
          priceMeasureType: market.publicSlug === "kalimati" ? "ARITHMETIC_MEAN" : "MIDPOINT",
          canonicalUnit: comm.canonicalUnit,
          version: 1,
          isCurrent: true,
          sourceObservationId: obsId,
        })
        .onConflictDoNothing();

      totalInserted++;
    }
  }

  console.log(`\n🎉 COMPLETE! Seeded ${totalInserted} active price records across ALL 12 markets and ALL categories!`);
}

seedFullCatalog().catch(console.error);