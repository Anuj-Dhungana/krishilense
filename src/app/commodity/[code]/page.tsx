import Link from "next/link";
import { unstable_cache } from "next/cache";
import CommodityPageClient from "./commodity-page-client";
import { db } from "../../../db";
import * as schema from "../../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BS_MONTH_NAMES_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

// Cache the 10-year multi-year seasonal baselines for 1 hour.
// This data only changes when the analytics pipeline (`recompute-analytics.ts`)
// runs, so caching avoids redundant Neon queries on every page view.
const getCachedBaselines = unstable_cache(
  async (marketId: number, commodityId: number) => {
    return await db
      .select()
      .from(schema.seasonalBaselines)
      .where(and(
        eq(schema.seasonalBaselines.marketId, marketId),
        eq(schema.seasonalBaselines.ampisCommodityId, commodityId)
      ))
      .orderBy(schema.seasonalBaselines.bsMonth);
  },
  ["commodity-seasonal-baselines"],
  { revalidate: 3600, tags: ["baselines"] }
);

export default async function CommodityPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ market?: string }>;
}) {
  const { code } = await params;
  const { market: urlMarket } = await searchParams;
  const marketSlug = urlMarket || "kalimati";

  // Batch 1: Look up commodity and market concurrently
  const [commodityRes, marketRes] = await Promise.all([
    db
      .select()
      .from(schema.ampisCommodities)
      .where(eq(schema.ampisCommodities.code, code))
      .limit(1),
    db
      .select()
      .from(schema.markets)
      .where(eq(schema.markets.publicSlug, marketSlug))
      .limit(1),
  ]);

  if (!commodityRes.length) {
    return <CommodityNotFoundServer />;
  }

  const currentMarket = marketRes[0] || { id: 1, nameNe: "कालिमाटी थोक बजार", nameEn: "Kalimati Wholesale Market" };
  const currentComm = commodityRes[0];

  // Batch 2: Concurrently fetch latestPrice, cached baselines, and 30-day rawDailyPrices
  const [latestPrice, baselines, rawDailyPrices] = await Promise.all([
    db
      .select()
      .from(schema.canonicalDailyMarketPrices)
      .where(and(
        eq(schema.canonicalDailyMarketPrices.marketId, currentMarket.id),
        eq(schema.canonicalDailyMarketPrices.ampisCommodityId, currentComm.id)
      ))
      .orderBy(desc(schema.canonicalDailyMarketPrices.dateAd))
      .limit(1),

    getCachedBaselines(currentMarket.id, currentComm.id),

    db
      .select({
        dateAd: schema.canonicalDailyMarketPrices.dateAd,
        bsMonth: schema.canonicalDailyMarketPrices.bsMonth,
        bsDay: schema.canonicalDailyMarketPrices.bsDay,
        minPrice: schema.canonicalDailyMarketPrices.minPrice,
        maxPrice: schema.canonicalDailyMarketPrices.maxPrice,
        repPrice: schema.canonicalDailyMarketPrices.representativePrice,
      })
      .from(schema.canonicalDailyMarketPrices)
      .where(and(
        eq(schema.canonicalDailyMarketPrices.marketId, currentMarket.id),
        eq(schema.canonicalDailyMarketPrices.ampisCommodityId, currentComm.id),
        eq(schema.canonicalDailyMarketPrices.isCurrent, true)
      ))
      .orderBy(desc(schema.canonicalDailyMarketPrices.dateAd))
      .limit(30),
  ]);

  const hasSeasonalBaselines = baselines.length >= 10;

  const seasonalCurve = baselines.map((b) => ({
    bs_month: b.bsMonth,
    month_name_ne: BS_MONTH_NAMES_NE[b.bsMonth - 1],
    median_price: parseFloat(b.baselineMonthlyMedian),
    spi: b.spi ? parseFloat(b.spi) : null,
    delta_spi_pct: b.deltaSpiPct ? parseFloat(b.deltaSpiPct) : null,
  }));

  const dailyTrendData = rawDailyPrices.reverse().map((d) => ({
    date_label: `${d.bsMonth}/${d.bsDay}`,
    min_price: parseFloat(d.minPrice),
    max_price: parseFloat(d.maxPrice),
    rep_price: parseFloat(d.repPrice),
  }));

  const sample = baselines[0];
  const riskProfile = sample ? {
    daily_cv: sample.cvDaily ? parseFloat(sample.cvDaily) : null,
    annual_cv: sample.cvAnnual ? parseFloat(sample.cvAnnual) : null,
    hcs: parseFloat(sample.historicalConfidenceScore),
    is_high_confidence: parseFloat(sample.historicalConfidenceScore) >= 75,
  } : null;

  const today = latestPrice[0];

  return (
    <CommodityPageClient
      commodity={{
        nameNe: currentComm.nameNe,
        nameEn: currentComm.nameEn,
        categoryNe: currentComm.categoryNe,
        code: currentComm.code,
        canonicalUnit: currentComm.canonicalUnit,
        imageUrl: currentComm.imageUrl,
      }}
      market={{
        nameNe: currentMarket.nameNe,
        nameEn: (currentMarket as { nameEn?: string }).nameEn || currentMarket.nameNe,
      }}
      today={today ? {
        representativePrice: parseFloat(today.representativePrice),
        minPrice: parseFloat(today.minPrice),
        maxPrice: parseFloat(today.maxPrice),
        sourceSystem: today.sourceSystem,
        sourceLabel: today.sourceLabel,
      } : null}
      hasSeasonalBaselines={hasSeasonalBaselines}
      seasonalCurve={seasonalCurve}
      dailyTrendData={dailyTrendData}
      riskProfile={riskProfile}
    />
  );
}

// Small server-rendered not-found fallback
// Cannot use hooks, so language will be handled by client wrapper
function CommodityNotFoundServer() {
  return (
    <div className="min-h-screen p-8 text-center bg-slate-50">
      <h2 className="text-xl font-bold text-slate-800">Commodity Not Found / बाली फेला परेन</h2>
      <Link href="/" className="text-emerald-700 underline mt-4 inline-block">
        ← Back to Home / गृहपृष्ठमा फर्कनुहोस्
      </Link>
    </div>
  );
}