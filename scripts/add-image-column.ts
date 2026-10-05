import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);

async function addColumn() {
  console.log("⏳ Adding 'image_url' column to ampis_commodities table in Neon...");
  
  await sql`
    ALTER TABLE ampis_commodities 
    ADD COLUMN IF NOT EXISTS image_url TEXT;
  `;

  console.log("✅ Success! 'image_url' column is now active in Neon PostgreSQL!");
}

addColumn().catch(console.error);