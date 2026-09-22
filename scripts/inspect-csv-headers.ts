import fs from "fs";
// @ts-ignore
import csv from "csv-parser";

async function inspectPart2() {
  console.log("🔍 Checking columns and sample rows in Part 2 (2021–2023)...\n");

  const stream = fs.createReadStream("./data/kalimati_2021_2023.csv").pipe(csv());
  let count = 0;

  for await (const row of stream) {
    if (count === 0) {
      console.log("📋 Exact Column Headers in Part 2:");
      console.log(Object.keys(row));
      console.log("\n📝 First 5 Sample Rows:");
    }
    console.log(row);
    count++;
    if (count >= 5) break;
  }
}

inspectPart2().catch(console.error);