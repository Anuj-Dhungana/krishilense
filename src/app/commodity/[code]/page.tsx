import Link from "next/link";
import IntelligenceTabs from "./intelligence-tabs";
import { db } from "../../../db";
import * as schema from "../../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const BS_MONTH_NAMES = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

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

  // 1. Get Commodity
  const commodity = await db
    .select()
    .from(schema.ampisCommodities)
    .where(eq(schema.ampisCommodities.code, code))
    .limit(1);

  if (!commodity.length) {
    return (
      <div className="min-h-screen p-8 text-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">बाली फेला परेन (Commodity Not Found)</h2>
        <Link href="/" className="text-emerald-700 underline mt-4 inline-block">
          ← गृहपृष्ठमा फर्कनुहोस् (Back to Home)
        </Link>
      </div>
    );
  }

  // 2. Get Market
  const market = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.publicSlug, marketSlug))
    .limit(1);

  const currentMarket = market[0] || { id: 1, nameNe: "कालिमाटी थोक बजार" };
  const currentComm = commodity[0];

  // 3. Get Today's Latest Price
  const latestPrice = await db
    .select()
    .from(schema.canonicalDailyMarketPrices)
    .where(and(
      eq(schema.canonicalDailyMarketPrices.marketId, currentMarket.id),
      eq(schema.canonicalDailyMarketPrices.ampisCommodityId, currentComm.id)
    ))
    .orderBy(desc(schema.canonicalDailyMarketPrices.dateAd))
    .limit(1);

  // 4. Get 12-Month Seasonal Baselines (if exists)
  const baselines = await db
    .select()
    .from(schema.seasonalBaselines)
    .where(and(
      eq(schema.seasonalBaselines.marketId, currentMarket.id),
      eq(schema.seasonalBaselines.ampisCommodityId, currentComm.id)
    ))
    .orderBy(schema.seasonalBaselines.bsMonth);

  const hasSeasonalBaselines = baselines.length >= 10;

  const seasonalCurve = baselines.map((b) => ({
    bs_month: b.bsMonth,
    month_name_ne: BS_MONTH_NAMES[b.bsMonth - 1],
    median_price: parseFloat(b.baselineMonthlyMedian),
    spi: b.spi ? parseFloat(b.spi) : null,
    delta_spi_pct: b.deltaSpiPct ? parseFloat(b.deltaSpiPct) : null,
  }));

  // 5. Query Recent Daily Prices (Up to 30 days)
  const rawDailyPrices = await db
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
    .limit(30);

  // Reverse so the chart plots chronologically left to right
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
    confidence_label: parseFloat(sample.historicalConfidenceScore) >= 75
      ? "उच्च ऐतिहासिक तथ्याङ्क विश्वसनीयता (High Confidence)"
      : "मध्यम ऐतिहासिक तथ्याङ्क (Moderate Evidence)",
  } : null;

  const today = latestPrice[0];

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {currentComm.nameNe}
          </h1>
          <p className="text-slate-500 text-sm">
            {currentComm.nameEn} • {currentComm.categoryNe} • बजार: {currentMarket.nameNe}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/compare?commodity=${currentComm.code}`}
            className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-lg border border-emerald-200 transition-colors"
          >
            📊 सबै बजारमा तुलना गर्नुहोस् ➔
          </Link>
          <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full font-mono text-slate-600 border">
            #{currentComm.code}
          </span>
        </div>
      </div>

      {/* Card 1: Today's Price Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">आजको औसत मूल्य (Average)</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 font-mono">
            रु. {today ? parseFloat(today.representativePrice).toFixed(2) : "—"}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">इकाइ: प्रति {currentComm.canonicalUnit}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">न्यूनतम मूल्य (Minimum)</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
            रु. {today ? parseFloat(today.minPrice).toFixed(2) : "—"}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">सुरुवाती थोक दर</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">अधिकतम मूल्य (Maximum)</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
            रु. {today ? parseFloat(today.maxPrice).toFixed(2) : "—"}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">उच्चतम कारोबार दर</span>
        </div>
      </div>

      {/* INTERACTIVE TOGGLE TABS SECTION */}
      <IntelligenceTabs
        cropNameNe={currentComm.nameNe}
        canonicalUnit={currentComm.canonicalUnit}
        seasonalCurve={seasonalCurve}
        hasSeasonalBaselines={hasSeasonalBaselines}
        confidenceLabel={riskProfile?.confidence_label}
        dailyTrendData={dailyTrendData}
      />

      {/* Card 3: Risk Profile (Shown when multi-year data is available) */}
      {hasSeasonalBaselines && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>📊</span> दैनिक मूल्य उतारचढाव (Daily Volatility)
            </h3>
            <div className="text-xl font-bold text-amber-600 font-mono">
              {riskProfile?.daily_cv ? `${riskProfile.daily_cv}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              महिनाभित्र दैनिक मूल्यमा हुने स्वाभाविक घटबढ।
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>🌱</span> वर्षगत उत्पादन स्थिरता (Annual Variability)
            </h3>
            <div className="text-xl font-bold text-emerald-700 font-mono">
              {riskProfile?.annual_cv ? `${riskProfile.annual_cv}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              प्रत्येक वर्ष यस महिनाको औसत मूल्य कति स्थिर रहन्छ भनी नाप्ने परिसूचक।
            </p>
          </div>
        </div>
      )}
    </main>
  );
}