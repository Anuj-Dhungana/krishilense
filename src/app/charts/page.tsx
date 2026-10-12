import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { db } from "../../db";
import * as schema from "../../db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import ChartSelectors from "./chart-selectors";
import ChartsDetail from "./charts-detail";
import ChartsHeader from "./charts-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "बाली चार्ट तथा बजार विश्लेषण (Charts) | KrishiLens Nepal",
  description:
    "नेपालका १२ वटै थोक बजारहरूको १२ महिने मौसमी चक्र, बाली पात्रो र दैनिक मूल्य उतारचढाव विश्लेषण।",
};

const BS_MONTH_NAMES_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत",
];

// Cache all commodities list for selector dropdown
const getCachedCommodities = unstable_cache(
  async () => {
    return await db
      .select({
        code: schema.ampisCommodities.code,
        nameNe: schema.ampisCommodities.nameNe,
        nameEn: schema.ampisCommodities.nameEn,
        categoryNe: schema.ampisCommodities.categoryNe,
        categoryEn: schema.ampisCommodities.categoryEn,
        canonicalUnit: schema.ampisCommodities.canonicalUnit,
      })
      .from(schema.ampisCommodities)
      .orderBy(asc(schema.ampisCommodities.categoryNe), asc(schema.ampisCommodities.nameNe));
  },
  ["charts-all-commodities-list"],
  { revalidate: 86400, tags: ["commodities"] }
);

// Cache all 12 federal wholesale markets for selector dropdown
const getCachedMarkets = unstable_cache(
  async () => {
    return await db
      .select({
        id: schema.markets.id,
        publicSlug: schema.markets.publicSlug,
        nameNe: schema.markets.nameNe,
        nameEn: schema.markets.nameEn,
      })
      .from(schema.markets)
      .orderBy(asc(schema.markets.id));
  },
  ["charts-all-markets-list"],
  { revalidate: 86400, tags: ["markets"] }
);

// Cache the 10-year multi-year seasonal baselines for 1 hour
const getCachedBaselines = unstable_cache(
  async (marketId: number, commodityId: number) => {
    return await db
      .select()
      .from(schema.seasonalBaselines)
      .where(
        and(
          eq(schema.seasonalBaselines.marketId, marketId),
          eq(schema.seasonalBaselines.ampisCommodityId, commodityId)
        )
      )
      .orderBy(schema.seasonalBaselines.bsMonth);
  },
  ["charts-commodity-seasonal-baselines"],
  { revalidate: 3600, tags: ["baselines"] }
);

interface ChartsPageProps {
  searchParams: Promise<{ commodity?: string; market?: string }>;
}

export default async function ChartsPage({ searchParams }: ChartsPageProps) {
  const { commodity: paramCommodity, market: paramMarket } = await searchParams;
  const commodityCode = paramCommodity || "101.1";
  const marketSlug = paramMarket || "kalimati";

  // Batch 1: Concurrently fetch all commodities, all markets, current commodity, and current market
  const [allCommodities, allMarkets, commodityRes, marketRes] = await Promise.all([
    getCachedCommodities(),
    getCachedMarkets(),
    db
      .select()
      .from(schema.ampisCommodities)
      .where(eq(schema.ampisCommodities.code, commodityCode))
      .limit(1),
    db
      .select()
      .from(schema.markets)
      .where(eq(schema.markets.publicSlug, marketSlug))
      .limit(1),
  ]);

  // Fallbacks if selected item does not exist
  const currentComm = commodityRes[0] || allCommodities.find((c) => c.code === "101.1") || allCommodities[0];
  const currentMarket =
    marketRes[0] ||
    allMarkets.find((m) => m.publicSlug === "kalimati") ||
    allMarkets[0] || {
      id: 1,
      publicSlug: "kalimati",
      nameNe: "कालिमाटी थोक बजार",
      nameEn: "Kalimati Wholesale Market",
    };

  if (!currentComm) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-900">
          कुनै पनि बाली फेला परेन। कृपया पछि पुन: प्रयास गर्नुहोस्।
        </div>
      </main>
    );
  }

  // Batch 2: Concurrently fetch latestPrice, cached baselines, and rolling 30-day rawDailyPrices
  const [latestPrice, baselines, rawDailyPrices] = await Promise.all([
    db
      .select()
      .from(schema.canonicalDailyMarketPrices)
      .where(
        and(
          eq(schema.canonicalDailyMarketPrices.marketId, currentMarket.id),
          eq(schema.canonicalDailyMarketPrices.ampisCommodityId, currentComm.id)
        )
      )
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
      .where(
        and(
          eq(schema.canonicalDailyMarketPrices.marketId, currentMarket.id),
          eq(schema.canonicalDailyMarketPrices.ampisCommodityId, currentComm.id),
          eq(schema.canonicalDailyMarketPrices.isCurrent, true)
        )
      )
      .orderBy(desc(schema.canonicalDailyMarketPrices.dateAd))
      .limit(30),
  ]);

  const hasSeasonalBaselines = baselines.length >= 10;

  const seasonalCurve = baselines.map((b) => ({
    bs_month: b.bsMonth,
    month_name_ne: BS_MONTH_NAMES_NE[b.bsMonth - 1] || `${b.bsMonth}`,
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
  const riskProfile = sample
    ? {
        daily_cv: sample.cvDaily ? parseFloat(sample.cvDaily) : null,
        annual_cv: sample.cvAnnual ? parseFloat(sample.cvAnnual) : null,
        hcs: parseFloat(sample.historicalConfidenceScore),
        is_high_confidence: parseFloat(sample.historicalConfidenceScore) >= 75,
      }
    : null;

  const today = latestPrice[0]
    ? {
        representativePrice: parseFloat(latestPrice[0].representativePrice),
        minPrice: parseFloat(latestPrice[0].minPrice),
        maxPrice: parseFloat(latestPrice[0].maxPrice),
        sourceSystem: latestPrice[0].sourceSystem,
        sourceLabel: latestPrice[0].sourceLabel,
      }
    : null;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* 1. Page Header (Dynamic Language Responsive) */}
      <ChartsHeader />

      {/* 2. Responsive Selector Bar */}
      <ChartSelectors
        commodities={allCommodities}
        markets={allMarkets}
        selectedCommodityCode={currentComm.code}
        selectedMarketSlug={currentMarket.publicSlug}
      />

      {/* 3. Commodity Banner, Snapshot Cards, Intelligence Tabs & Risk Profile */}
      <ChartsDetail
        commodity={{
          code: currentComm.code,
          nameNe: currentComm.nameNe,
          nameEn: currentComm.nameEn,
          categoryNe: currentComm.categoryNe,
          categoryEn: currentComm.categoryEn,
          canonicalUnit: currentComm.canonicalUnit,
          imageUrl: currentComm.imageUrl,
        }}
        market={{
          publicSlug: currentMarket.publicSlug,
          nameNe: currentMarket.nameNe,
          nameEn: currentMarket.nameEn,
        }}
        today={today}
        hasSeasonalBaselines={hasSeasonalBaselines}
        seasonalCurve={seasonalCurve}
        dailyTrendData={dailyTrendData}
        riskProfile={riskProfile}
      />
    </main>
  );
}
