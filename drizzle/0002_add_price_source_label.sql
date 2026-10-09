ALTER TABLE "canonical_daily_market_prices"
  ADD COLUMN IF NOT EXISTS "source_label" text;
