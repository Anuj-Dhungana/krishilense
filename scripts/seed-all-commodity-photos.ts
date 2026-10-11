import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { eq, like, isNotNull } from "drizzle-orm";

const rawUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL is missing in .env or .env.local");

const httpUrl = rawUrl.replace("-pooler", "");
const sql = neon(httpUrl);
const db = drizzle(sql, { schema });

async function main() {
  console.log("🔍 Checking ampis_commodities for newsmeter.in or unoptimized photo URLs...");

  // 1. Search for any commodities with newsmeter.in
  const newsmeterRows = await db
    .select({
      id: schema.ampisCommodities.id,
      code: schema.ampisCommodities.code,
      nameEn: schema.ampisCommodities.nameEn,
      nameNe: schema.ampisCommodities.nameNe,
      imageUrl: schema.ampisCommodities.imageUrl,
    })
    .from(schema.ampisCommodities)
    .where(like(schema.ampisCommodities.imageUrl, "%newsmeter%"));

  console.log(`Found ${newsmeterRows.length} commodities with newsmeter.in URLs.`);

  for (const row of newsmeterRows) {
    console.log(`Replacing newsmeter URL for ${row.code} (${row.nameEn} / ${row.nameNe}): ${row.imageUrl}`);
    
    // Choose appropriate optimized Unsplash photo for sweet potato
    const fallbackUrl = "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=300&q=80&auto=format&fit=crop";
    
    await db
      .update(schema.ampisCommodities)
      .set({ imageUrl: fallbackUrl })
      .where(eq(schema.ampisCommodities.code, row.code));
      
    console.log(`  -> Updated to: ${fallbackUrl}`);
  }

  // Ensure commodity 132 specifically has the high-quality sweet potato CDN photo
  await db
    .update(schema.ampisCommodities)
    .set({
      imageUrl:
        "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=300&q=80&auto=format&fit=crop",
    })
    .where(eq(schema.ampisCommodities.code, "132"));

  // 2. Report all active commodity image URLs in database
  const allWithImages = await db
    .select({
      code: schema.ampisCommodities.code,
      nameEn: schema.ampisCommodities.nameEn,
      nameNe: schema.ampisCommodities.nameNe,
      imageUrl: schema.ampisCommodities.imageUrl,
    })
    .from(schema.ampisCommodities)
    .where(isNotNull(schema.ampisCommodities.imageUrl));

  console.log(`\nTotal commodities with images: ${allWithImages.length}`);
  for (const item of allWithImages) {
    console.log(`- [${item.code}] ${item.nameEn} (${item.nameNe}): ${item.imageUrl}`);
  }

  console.log("\n✅ Database photo verification and clean-up complete!");
}

main().catch((err) => {
  console.error("❌ Error in seed-all-commodity-photos:", err);
  process.exit(1);
});
