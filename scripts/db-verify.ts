import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

async function verifyDatabase() {
  const sql = neon(dbUrl!);
  
  console.log("🔍 Checking tables in your Neon database...\n");

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  console.log(`🎉 Found ${tables.length} tables in Neon:`);
  tables.forEach((row, index) => {
    console.log(`  ${index + 1}. ${row.table_name}`);
  });
}

verifyDatabase().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});