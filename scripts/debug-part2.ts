import fs from "fs";
// @ts-ignore
import csv from "csv-parser";
import { CSV_COMMODITY_MAP } from "../src/lib/ingestion/csv-name-map";

async function debugPart2() {
  console.log("🔍 Checking first 3 parsed chunks of Part 2...\n");

  const stream = fs.createReadStream("./data/kalimati_2021_2023.csv").pipe(
    csv({ headers: ["Commodity", "Date", "Unit", "Minimum", "Maximum", "Average"] })
  );

  let count = 0;
  for await (const chunk of stream) {
    console.log(`--- Row ${count + 1} ---`);
    console.log("Keys:", Object.keys(chunk));
    console.log("Data:", chunk);
    console.log("Raw Commodity String:", JSON.stringify(chunk.Commodity));
    console.log("Mapped Code:", CSV_COMMODITY_MAP[(chunk.Commodity || "").trim()]);
    count++;
    if (count >= 3) break;
  }
}

debugPart2().catch(console.error);