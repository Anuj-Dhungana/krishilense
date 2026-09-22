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

async function seedAllMarkets() {
  console.log("🏪 Seeding All 12 Official AMPIS Federal Wholesale Markets...\n");

  const provinces = await db.select().from(schema.provinces);
  const provMap = new Map(provinces.map((p) => [p.slug, p.id]));

  // 1. Seed Missing Districts: Sindhuli, Nawalpur, Banke, Sarlahi
  const newDistricts = [
    { provinceId: provMap.get("bagmati")!, slug: "sindhuli", nameEn: "Sindhuli", nameNe: "सिन्धुली", defaultAgroZone: "MID_HILLS" as const, averageElevationMeters: 1100 },
    { provinceId: provMap.get("gandaki")!, slug: "nawalpur", nameEn: "Nawalpur", nameNe: "नवलपरासी (बर्दघाट सुस्ता पूर्व)", defaultAgroZone: "TERAI" as const, averageElevationMeters: 180 },
    { provinceId: provMap.get("lumbini")!, slug: "banke", nameEn: "Banke", nameNe: "बाँके", defaultAgroZone: "TERAI" as const, averageElevationMeters: 140 },
    { provinceId: provMap.get("madhesh")!, slug: "sarlahi", nameEn: "Sarlahi", nameNe: "सर्लाही", defaultAgroZone: "TERAI" as const, averageElevationMeters: 95 },
  ];

  await db.insert(schema.administrativeDistricts).values(newDistricts).onConflictDoNothing();
  const allDistricts = await db.select().from(schema.administrativeDistricts);
  const distMap = new Map(allDistricts.map((d) => [d.slug, d.id]));

  // 2. Seed Missing Municipalities
  const newMunicipalities = [
    { districtId: distMap.get("sindhuli")!, slug: "kamalamai-mun", nameEn: "Kamalamai Municipality", nameNe: "कमलामाई नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 1100 },
    { districtId: distMap.get("nawalpur")!, slug: "kawasoti-mun", nameEn: "Kawasoti Municipality", nameNe: "कावासोती नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 180 },
    { districtId: distMap.get("banke")!, slug: "kohalpur-mun", nameEn: "Kohalpur Municipality", nameNe: "कोहलपुर नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 145 },
    { districtId: distMap.get("sarlahi")!, slug: "lalbandi-mun", nameEn: "Lalbandi Municipality", nameNe: "लालबन्दी नगरपालिका", municipalityType: "MUNICIPALITY" as const, elevationMeters: 120 },
  ];

  await db.insert(schema.municipalities).values(newMunicipalities).onConflictDoNothing();
  const allMun = await db.select().from(schema.municipalities);
  const munMap = new Map(allMun.map((m) => [m.slug, m.id]));

  // 3. Seed The 4 Missing Markets (Completing the full 12 AMPIS markets)
  const newMarkets = [
    { publicSlug: "kamalamai", nameEn: "Kamalamai Agriculture Market", nameNe: "कमलामाई कृषि बजार", municipalityId: munMap.get("kamalamai-mun")!, elevationMeters: 1100, latitude: "27.250000", longitude: "85.916700", isFederalHub: true },
    { publicSlug: "kawasoti", nameEn: "Kawasoti Agriculture Market", nameNe: "कावासोती कृषि बजार", municipalityId: munMap.get("kawasoti-mun")!, elevationMeters: 180, latitude: "27.650000", longitude: "84.133300", isFederalHub: true },
    { publicSlug: "kohalpur", nameEn: "Kohalpur Agriculture Market", nameNe: "कोहलपुर कृषि बजार", municipalityId: munMap.get("kohalpur-mun")!, elevationMeters: 145, latitude: "28.183300", longitude: "81.716700", isFederalHub: true },
    { publicSlug: "lalbandi", nameEn: "Lalbandi Agriculture Market", nameNe: "लालबन्दी कृषि बजार", municipalityId: munMap.get("lalbandi-mun")!, elevationMeters: 120, latitude: "27.050000", longitude: "85.550000", isFederalHub: true },
  ];

  await db.insert(schema.markets).values(newMarkets).onConflictDoNothing();

  const totalMarkets = await db.select().from(schema.markets);
  console.log(`✅ Success! Your database now has all ${totalMarkets.length} official AMPIS wholesale markets!`);
  totalMarkets.forEach((m, idx) => console.log(`  ${idx + 1}. ${m.nameNe} (${m.publicSlug})`));
}

seedAllMarkets().catch(console.error);