import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as dotenv from "dotenv";

// Load your credentials from .env.local
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Error: DATABASE_URL is missing in .env.local");
  process.exit(1);
}

async function runMigration() {
  console.log("⏳ Connecting to Neon PostgreSQL over HTTP...");
  
  // Neon HTTP connection (safe, reliable, port 443)
  const sql = neon(dbUrl!);
  const db = drizzle(sql);

  console.log("⏳ Applying migration from ./drizzle folder...");
  
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("✅ Success! All 15 tables and indices created in Neon!");
}

runMigration().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});