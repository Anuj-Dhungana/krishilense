import * as cheerio from "cheerio";
import { parseNepaleseNumber, normalizeUnit } from "../sanitizer";

export interface ParsedCommodityRow {
  commodityNameNe: string;
  categoryNe: string;
  unit: string;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
}

export function parseAmpisHtml(html: string): ParsedCommodityRow[] {
  const $ = cheerio.load(html);
  const rows: ParsedCommodityRow[] = [];

  // Find all Drupal Views tables with class cols-5
  $("table.cols-5").each((_, tableElement) => {
    // Caption holds the Category (e.g. 'तरकारी', 'फलफूल')
    const categoryNe = $(tableElement).find("caption").text().trim() || "तरकारी";

    // Loop through each table row inside tbody
    $(tableElement).find("tbody tr").each((_, tr) => {
      const commodityNameNe = $(tr)
        .find(".views-field-field-market-rate-commodity")
        .text()
        .trim();

      const rawUnit = $(tr)
        .find(".views-field-field-market-rate-unit")
        .text()
        .trim();

      const rawMin = $(tr)
        .find(".views-field-field-market-rate-minimum")
        .text()
        .trim();

      const rawMax = $(tr)
        .find(".views-field-field-market-rate-maximum")
        .text()
        .trim();

      const rawAvg = $(tr)
        .find(".views-field-views-conditional-field-1")
        .text()
        .trim();

      if (commodityNameNe) {
        rows.push({
          commodityNameNe,
          categoryNe,
          unit: normalizeUnit(rawUnit),
          minPrice: parseNepaleseNumber(rawMin),
          maxPrice: parseNepaleseNumber(rawMax),
          avgPrice: parseNepaleseNumber(rawAvg),
        });
      }
    });
  });

  return rows;
}