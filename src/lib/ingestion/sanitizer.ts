const DEVANAGARI_DIGIT_MAP: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

/**
 * Converts Devanagari numerals (०-९) to Western Arabic digits (0-9)
 * and strips currency symbols, commas, but PRESERVES the decimal point (.)
 */
export function parseNepaleseNumber(input: string | null | undefined): number | null {
  if (!input) return null;

  // 1. Convert Devanagari numerals
  const converted = input.replace(/[०-९]/g, (char) => DEVANAGARI_DIGIT_MAP[char] || char);

  // 2. Strip currency prefixes, commas, whitespace — KEEP the dot (.)!
  const sanitized = converted
    .replace(/[रुRs,\s]/gi, "")
    .trim();

  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? null : parsed;
}

export function normalizeUnit(rawUnit: string): string {
  const cleaned = rawUnit.trim();
  if (cleaned.includes("के") || cleaned.toLowerCase().includes("kg")) return "kg";
  if (cleaned.includes("दर्जन") || cleaned.toLowerCase().includes("dozen")) return "dozen";
  if (cleaned.includes("थान") || cleaned.toLowerCase().includes("piece")) return "piece";
  if (cleaned.includes("क्विन्टल") || cleaned.toLowerCase().includes("quintal")) return "quintal";
  return cleaned;
}