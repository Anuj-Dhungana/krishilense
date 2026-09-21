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

async function seedBaselines() {
  console.log("📈 Seeding 12-Month Historical Seasonal Baselines for Priority Crops...\n");

  const kalimati = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.publicSlug, "kalimati"))
    .limit(1);

  if (!kalimati.length) throw new Error("Kalimati market not found.");
  const marketId = kalimati[0].id;

  const commodities = await db.select().from(schema.ampisCommodities);
  const commMap = new Map(commodities.map((c) => [c.code, c.id]));

  // Multi-year monthly price patterns (Baisakh=1 to Chaitra=12)
  // Reflecting real seasonal trends in Nepal (Glut in winter, high in monsoon)
  const baselineProfiles: Record<string, { medians: number[]; grandMedian: number; cvDaily: number; cvAnnual: number }> = {
    // Tomato Big: Peak in Ashad-Bhadra (monsoon shortage), lowest in Poush-Magh (winter Terai harvest)
    "101.1": {
      medians: [42.0, 48.0, 75.0, 85.0, 92.0, 68.0, 52.0, 45.0, 32.0, 35.0, 40.0, 45.0],
      grandMedian: 54.9,
      cvDaily: 22.4,
      cvAnnual: 18.5,
    },
    // Cauliflower: Peak in Bhadra-Ashwin (early off-season), lowest in Poush-Magh (peak winter harvest)
    "110.1": {
      medians: [55.0, 65.0, 75.0, 85.0, 95.0, 78.0, 45.0, 32.0, 22.0, 25.0, 35.0, 48.0],
      grandMedian: 55.0,
      cvDaily: 24.1,
      cvAnnual: 14.8,
    },
    // Dry Onion: Stored crop, relatively stable with festival peak around Ashwin/Kartik
    "106.1": {
      medians: [65.0, 68.0, 72.0, 78.0, 82.0, 88.0, 92.0, 85.0, 74.0, 70.0, 66.0, 64.0],
      grandMedian: 75.3,
      cvDaily: 12.5,
      cvAnnual: 11.2,
    },
    // Cabbage: Peak in Shrawan-Bhadra, lowest in Poush-Falgun
    "108.1": {
      medians: [28.0, 35.0, 42.0, 48.0, 52.0, 38.0, 25.0, 18.0, 14.0, 15.0, 18.0, 24.0],
      grandMedian: 29.8,
      cvDaily: 19.8,
      cvAnnual: 15.1,
    },
  };

  for (const [code, profile] of Object.entries(baselineProfiles)) {
    const commId = commMap.get(code);
    if (!commId) continue;

    console.log(`  📊 Writing 12-month baseline for Commodity #${code}...`);

    for (let month = 1; month <= 12; month++) {
      const monthlyMedian = profile.medians[month - 1];
      const spi = Number(((monthlyMedian / profile.grandMedian) * 100).toFixed(2));
      const deltaSpi = Number((spi - 100).toFixed(2));

      await db
        .insert(schema.seasonalBaselines)
        .values({
          marketId: marketId,
          ampisCommodityId: commId,
          bsMonth: month,
          baselineStartYearBs: 2079,
          baselineEndYearBs: 2082,
          baselineMonthlyMedian: monthlyMedian.toFixed(2),
          grandAnnualMedian: profile.grandMedian.toFixed(2),
          spi: spi.toFixed(2),
          deltaSpiPct: deltaSpi.toFixed(2),
          cvDaily: profile.cvDaily.toFixed(2),
          cvAnnual: profile.cvAnnual.toFixed(2),
          validYearsCount: 4,
          totalObservationsCount: 96,
          historicalConfidenceScore: "84.50",
          analyticsMethodologyVersion: "v1.1-phase3.4-A1",
          parameterConfigVersion: "param-v1.0-defaults",
        })
        .onConflictDoNothing();
    }
  }

  console.log("\n✅ Seasonal Baselines Successfully Seeded for 12 BS Months!");
}

seedBaselines().catch(console.error);