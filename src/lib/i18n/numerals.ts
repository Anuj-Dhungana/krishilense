/**
 * Nepali (Devanagari) numeral conversion utilities.
 * Digits: ० १ २ ३ ४ ५ ६ ७ ८ ९
 */

const NE_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/**
 * Convert every ASCII digit in a string or number to its Devanagari equivalent.
 * Non-digit characters (., -, +, %, /, space, etc.) are preserved as-is.
 */
export function toNepaliNumerals(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value).replace(/[0-9]/g, (d) => NE_DIGITS[parseInt(d, 10)]);
}

/**
 * Format a price number for display, converting to Nepali numerals when lang is "ne".
 * @param value   The numeric value or string (e.g. 75.5 or "75.50")
 * @param lang    Active language ("ne" | "en")
 * @param digits  Decimal places (default 2)
 */
export function formatPrice(
  value: number | string | null | undefined,
  lang: string,
  digits = 2
): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return "—";
  const formatted = digits > 0 ? num.toFixed(digits) : Math.round(num).toString();
  return lang === "ne" ? toNepaliNumerals(formatted) : formatted;
}

/**
 * Format a plain integer, count, or string containing numbers for display.
 */
export function formatCount(
  value: number | string | null | undefined,
  lang: string
): string {
  if (value == null || value === "") return lang === "ne" ? "०" : "0";
  return lang === "ne" ? toNepaliNumerals(value) : String(value);
}

/**
 * Format a percentage like "+12.50%" or "-3.20%".
 */
export function formatPct(
  value: number | string | null | undefined,
  lang: string,
  digits = 2
): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return "—";
  const sign = num > 0 ? "+" : "";
  const formatted = `${sign}${num.toFixed(digits)}%`;
  return lang === "ne" ? toNepaliNumerals(formatted) : formatted;
}

/**
 * Format a date string (YYYY-MM-DD or BS date string like 2081-06-12) to Nepali numerals.
 */
export function formatDate(
  dateStr: string | null | undefined,
  lang: string
): string {
  if (!dateStr) return "";
  return lang === "ne" ? toNepaliNumerals(dateStr) : String(dateStr);
}
