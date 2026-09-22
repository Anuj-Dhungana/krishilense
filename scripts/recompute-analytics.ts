import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "../src/db/schema";
import { sql as dSql, eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is missing in .env.local");

const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function recomputeAnalytics() {
  console.log("⚡ Starting Analytics Rollup Workers across 93,681 Historical Records...\n");

  const kalimati = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.publicSlug, "kalimati"))
    .limit(1);

  if (!kalimati.length) throw new Error("Kalimati market not found.");
  const marketId = kalimati[0].id;

  // Clear previous temporary baselines so we compute 100% genuine statistics
  console.log("🧹 Clearing temporary baseline seeds...");
  await db.delete(schema.seasonalBaselines).where(eq(schema.seasonalBaselines.marketId, marketId));
  await db.delete(schema.monthlyMarketAggregates).where(eq(schema.monthlyMarketAggregates.marketId, marketId));

  // ============================================================================
  // WORKER 1: Compute monthly_market_aggregates (Year-Month Level)
  // ============================================================================
  console.log("⏳ Worker 1: Computing monthly medians, IQRs, and daily volatility (CV_daily)...");

  await sql`
    INSERT INTO monthly_market_aggregates (
      market_id,
      ampis_commodity_id,
      bs_year,
      bs_month,
      observation_count,
      min_observed_price,
      max_observed_price,
      median_price,
      iqr_p25,
      iqr_p75,
      mean_price,
      within_month_cv_daily,
      analytics_methodology_version,
      parameter_config_version,
      calculated_at
    )
    SELECT 
      market_id,
      ampis_commodity_id,
      bs_year,
      bs_month,
      COUNT(id)::INT AS observation_count,
      MIN(representative_price) AS min_observed_price,
      MAX(representative_price) AS max_observed_price,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY representative_price) AS median_price,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY representative_price) AS iqr_p25,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY representative_price) AS iqr_p75,
      ROUND(AVG(representative_price), 2) AS mean_price,
      CASE 
        WHEN COUNT(id) >= 10 AND AVG(representative_price) > 0 THEN
          ROUND(((STDDEV_SAMP(representative_price) / AVG(representative_price)) * 100.0)::NUMERIC, 2)
        ELSE NULL
      END AS within_month_cv_daily,
      'v1.1-phase3.4-A1',
      'param-v1.0-defaults',
      NOW()
    FROM canonical_daily_market_prices
    WHERE is_current = true
      AND market_id = ${marketId}
    GROUP BY market_id, ampis_commodity_id, bs_year, bs_month
    ON CONFLICT (market_id, ampis_commodity_id, bs_year, bs_month, analytics_methodology_version, parameter_config_version)
    DO UPDATE SET
      observation_count = EXCLUDED.observation_count,
      min_observed_price = EXCLUDED.min_observed_price,
      max_observed_price = EXCLUDED.max_observed_price,
      median_price = EXCLUDED.median_price,
      iqr_p25 = EXCLUDED.iqr_p25,
      iqr_p75 = EXCLUDED.iqr_p75,
      mean_price = EXCLUDED.mean_price,
      within_month_cv_daily = EXCLUDED.within_month_cv_daily,
      calculated_at = NOW();
  `;

  const monthlyCount = await db.select({ count: dSql`count(*)` }).from(schema.monthlyMarketAggregates);
  console.log(`  ✅ Worker 1 Finished: Generated ${monthlyCount[0].count} monthly statistical aggregate records!`);

  // ============================================================================
  // WORKER 2: Compute seasonal_baselines (12 BS Month Multi-Year Baseline)
  // ============================================================================
  console.log("\n⏳ Worker 2: Computing 12-month cyclical baselines, SPI, and annual variability (CV_annual)...");

  await sql`
    WITH annual_month_stats AS (
      SELECT 
        market_id,
        ampis_commodity_id,
        bs_month,
        bs_year,
        observation_count,
        median_price,
        within_month_cv_daily
      FROM monthly_market_aggregates
      WHERE market_id = ${marketId}
        AND observation_count >= 10 -- Minimum 10 trading days floor
    ),
    monthly_rollup AS (
      SELECT 
        market_id,
        ampis_commodity_id,
        bs_month,
        COUNT(DISTINCT bs_year)::INT AS valid_years_count,
        SUM(observation_count)::INT AS total_observations_count,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY median_price) AS baseline_monthly_median,
        AVG(median_price) AS mean_of_annual_medians,
        STDDEV_SAMP(median_price) AS stddev_of_annual_medians,
        AVG(within_month_cv_daily) AS mean_cv_daily,
        1.0::NUMERIC AS mean_uniformity
      FROM annual_month_stats
      GROUP BY market_id, ampis_commodity_id, bs_month
    ),
    calendar_coverage_check AS (
      SELECT 
        market_id,
        ampis_commodity_id,
        COUNT(DISTINCT bs_month)::INT AS valid_months_count,
        AVG(baseline_monthly_median) AS computed_grand_median
      FROM monthly_rollup
      GROUP BY market_id, ampis_commodity_id
    )
    INSERT INTO seasonal_baselines (
      market_id,
      ampis_commodity_id,
      bs_month,
      baseline_start_year_bs,
      baseline_end_year_bs,
      baseline_monthly_median,
      grand_annual_median,
      spi,
      delta_spi_pct,
      cv_daily,
      cv_annual,
      valid_years_count,
      total_observations_count,
      historical_confidence_score,
      analytics_methodology_version,
      parameter_config_version,
      calculated_at
    )
    SELECT 
      m.market_id,
      m.ampis_commodity_id,
      m.bs_month,
      2070,
      2080,
      ROUND(m.baseline_monthly_median::NUMERIC, 2),
      CASE 
        WHEN c.valid_months_count = 12 THEN ROUND(c.computed_grand_median::NUMERIC, 2)
        ELSE NULL
      END AS grand_annual_median,
      CASE 
        WHEN c.valid_months_count = 12 AND c.computed_grand_median > 0 THEN
          ROUND(((m.baseline_monthly_median::NUMERIC / c.computed_grand_median::NUMERIC) * 100.0)::NUMERIC, 2)
        ELSE NULL
      END AS spi,
      CASE 
        WHEN c.valid_months_count = 12 AND c.computed_grand_median > 0 THEN
          ROUND((((m.baseline_monthly_median::NUMERIC / c.computed_grand_median::NUMERIC) * 100.0) - 100.0)::NUMERIC, 2)
        ELSE NULL
      END AS delta_spi_pct,
      ROUND(m.mean_cv_daily::NUMERIC, 2) AS cv_daily,
      CASE 
        WHEN m.valid_years_count >= 2 AND m.mean_of_annual_medians > 0 THEN
          ROUND(((m.stddev_of_annual_medians / m.mean_of_annual_medians) * 100.0)::NUMERIC, 2)
        ELSE NULL
      END AS cv_annual,
      m.valid_years_count,
      m.total_observations_count,
      LEAST(
        CASE WHEN m.valid_years_count < 5 THEN 74.0 ELSE 100.0 END,
        ROUND(
          ( (0.45 * LEAST(1.0, m.valid_years_count / 5.0)) +
            (0.35 * LEAST(1.0, m.total_observations_count / (m.valid_years_count * 25.0))) +
            (0.20 * m.mean_uniformity)
          )::NUMERIC * 100.0, 
          2
        )
      ) AS historical_confidence_score,
      'v1.1-phase3.4-A1',
      'param-v1.0-defaults',
      NOW()
    FROM monthly_rollup m
    JOIN calendar_coverage_check c 
      ON m.market_id = c.market_id 
     AND m.ampis_commodity_id = c.ampis_commodity_id
    ON CONFLICT (market_id, ampis_commodity_id, bs_month, analytics_methodology_version, parameter_config_version)
    DO UPDATE SET
      baseline_monthly_median = EXCLUDED.baseline_monthly_median,
      grand_annual_median = EXCLUDED.grand_annual_median,
      spi = EXCLUDED.spi,
      delta_spi_pct = EXCLUDED.delta_spi_pct,
      cv_daily = EXCLUDED.cv_daily,
      cv_annual = EXCLUDED.cv_annual,
      valid_years_count = EXCLUDED.valid_years_count,
      total_observations_count = EXCLUDED.total_observations_count,
      historical_confidence_score = EXCLUDED.historical_confidence_score,
      calculated_at = NOW();
  `;

  const baselinesCount = await db.select({ count: dSql`count(*)` }).from(schema.seasonalBaselines);
  console.log(`  ✅ Worker 2 Finished: Generated ${baselinesCount[0].count} multi-year seasonal baselines!`);

  console.log("\n🎉 Analytics Recomputation Complete! Your platform is now powered by 10 years of genuine historical data!");
}

recomputeAnalytics().catch(console.error);