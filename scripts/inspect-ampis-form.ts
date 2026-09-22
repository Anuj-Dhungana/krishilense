import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import * as cheerio from "cheerio";
import { desc } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function inspectForm() {
  console.log("🔍 Inspecting AMPIS form fields, dropdowns, and URLs from Batch #1...\n");

  const batches = await db
    .select()
    .from(schema.rawIngestionBatches)
    .orderBy(desc(schema.rawIngestionBatches.id))
    .limit(1);

  if (!batches.length) return;

  const html = batches[0].rawPayload;
  const $ = cheerio.load(html);

  // 1. Look for form action and method
  $("form").each((i, form) => {
    const action = $(form).attr("action");
    const method = $(form).attr("method") || "GET";
    const formId = $(form).attr("id") || `form-${i}`;
    console.log(`📋 Form Found: [ID: ${formId}] | Method: ${method} | Action: ${action}`);

    // Inspect select elements inside this form
    $(form).find("select").each((_, sel) => {
      const name = $(sel).attr("name");
      const label = $(sel).closest(".form-item").find("label").text().trim() || name;
      console.log(`\n  🔽 Dropdown Field: name="${name}" (Label: "${label}")`);

      $(sel).find("option").each((_, opt) => {
        const val = $(opt).attr("value");
        const txt = $(opt).text().trim();
        if (val && val !== "All" && val !== "_none") {
          console.log(`     • Value: "${val}" ➔ "${txt}"`);
        }
      });
    });
  });

  // 2. Look for "View All" link
  $('a:contains("View All"), a:contains("सबै हेर्नुहोस्")').each((_, a) => {
    console.log(`\n🔗 "View All" Link Found: href="${$(a).attr("href")}"`);
  });
}

inspectForm().catch(console.error);