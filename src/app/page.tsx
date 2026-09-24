import Link from "next/link";
import MarketSelector from "./market-selector";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "सबै (All)",
  "तरकारी",
  "खाद्यान्न बाली",
  "दुग्धजन्य",
  "मासु",
  "फलफूल",
  "मसला बाली",
  "सागपात",
  "च्याउ खेती",
  "कन्दमुल बाली",
  "कोसे / दाल बाली",
  "माछा",
];
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; category?: string }>;
}) {
  const { market: urlMarket, category: urlCategory } = await searchParams;
  const activeMarketSlug = urlMarket || "kalimati";
  const activeCategory = urlCategory || "सबै (All)";

  // 1. Get All Markets for the Dropdown
  const marketsList = await db
    .select({
      id: schema.markets.id,
      public_slug: schema.markets.publicSlug,
      name_ne: schema.markets.nameNe,
      name_en: schema.markets.nameEn,
      district: {
        name_ne: schema.administrativeDistricts.nameNe,
      },
    })
    .from(schema.markets)
    .innerJoin(schema.municipalities, eq(schema.markets.municipalityId, schema.municipalities.id))
    .innerJoin(schema.administrativeDistricts, eq(schema.municipalities.districtId, schema.administrativeDistricts.id))
    .orderBy(schema.markets.id);

  // 2. Identify active market
  const currentMarket = marketsList.find((m) => m.public_slug === activeMarketSlug) || marketsList[0];
  const marketId = currentMarket?.id || 1;

  // 3. Find the single latest available date for this market
  const latestDateQuery = await db
    .select({
      dateAd: schema.canonicalDailyMarketPrices.dateAd,
      bsYear: schema.canonicalDailyMarketPrices.bsYear,
      bsMonth: schema.canonicalDailyMarketPrices.bsMonth,
      bsDay: schema.canonicalDailyMarketPrices.bsDay,
    })
    .from(schema.canonicalDailyMarketPrices)
    .where(and(
      eq(schema.canonicalDailyMarketPrices.marketId, marketId),
      eq(schema.canonicalDailyMarketPrices.isCurrent, true)
    ))
    .orderBy(desc(schema.canonicalDailyMarketPrices.dateAd))
    .limit(1);

  const latestDateAd = latestDateQuery[0]?.dateAd;
  const dateInfo = latestDateQuery[0] ? {
    date_ad: latestDateQuery[0].dateAd,
    bs_date: `${latestDateQuery[0].bsYear}-${String(latestDateQuery[0].bsMonth).padStart(2, "0")}-${String(latestDateQuery[0].bsDay).padStart(2, "0")}`,
  } : null;

  // 4. Query ONLY the commodities for this market and this specific latest date
  let rawPrices: any[] = [];
  if (latestDateAd) {
    rawPrices = await db
      .select({
        id: schema.canonicalDailyMarketPrices.id,
        commodity_code: schema.ampisCommodities.code,
        commodity_name_en: schema.ampisCommodities.nameEn,
        commodity_name_ne: schema.ampisCommodities.nameNe,
        category_ne: schema.ampisCommodities.categoryNe,
        canonical_unit: schema.canonicalDailyMarketPrices.canonicalUnit,
        min_price: schema.canonicalDailyMarketPrices.minPrice,
        max_price: schema.canonicalDailyMarketPrices.maxPrice,
        representative_price: schema.canonicalDailyMarketPrices.representativePrice,
      })
      .from(schema.canonicalDailyMarketPrices)
      .innerJoin(schema.ampisCommodities, eq(schema.canonicalDailyMarketPrices.ampisCommodityId, schema.ampisCommodities.id))
      .where(and(
        eq(schema.canonicalDailyMarketPrices.marketId, marketId),
        eq(schema.canonicalDailyMarketPrices.dateAd, latestDateAd),
        eq(schema.canonicalDailyMarketPrices.isCurrent, true)
      ))
      .orderBy(schema.ampisCommodities.categoryNe, schema.ampisCommodities.code);
  }

  // 5. Compute categories and counts dynamically for this market's bulletin
  const categoryCounts = new Map<string, number>();
  for (const item of rawPrices) {
    const cat = item.category_ne?.trim();
    if (cat) {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    }
  }

  const marketCategoryPills = [
    { label: "सबै (All)", count: rawPrices.length },
    ...CATEGORIES.filter((cat) => cat !== "सबै (All)" && categoryCounts.has(cat))
      .map((cat) => ({ label: cat, count: categoryCounts.get(cat)! })),
    ...Array.from(categoryCounts.keys())
      .filter((cat) => !CATEGORIES.includes(cat))
      .map((cat) => ({ label: cat, count: categoryCounts.get(cat)! })),
  ];

  // 6. Filter by Category
  const filteredPrices = activeCategory === "सबै (All)"
    ? rawPrices
    : rawPrices.filter((p) => p.category_ne?.trim() === activeCategory || p.category_ne?.includes(activeCategory));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block px-2.5 py-0.5 bg-emerald-600/60 rounded text-xs tracking-wider uppercase font-semibold">
            दैनिक थोक बजार बुलेटिन
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            कृषि बजार बुझौं, सही समयमा सही बाली चुनौं
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base">
            नेपालका १२ वटै प्रमुख संघीय कृषि थोक बजारहरूको दैनिक मूल्य, ऐतिहासिक मौसमी चक्र र बाली योजना निर्णय प्रणाली।
          </p>
          <div className="pt-2">
            <Link
              href="/plan"
              className="inline-block px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl text-xs sm:text-sm shadow transition-colors"
            >
              🎯 आफ्नो जग्गा अनुसार बाली सिफारिस हेर्नुहोस् (What to Grow) ➔
            </Link>
          </div>
        </div>
      </section>

      {/* Market Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span>📍</span> {currentMarket?.name_ne || "कृषि थोक बजार"}
          </h3>
          <p className="text-xs text-slate-500">
            तथ्याङ्क मिति: {dateInfo?.bs_date || "आज"} वि.सं. ({dateInfo?.date_ad || ""}) • गणना विधि: थोक दर
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <MarketSelector markets={marketsList} currentMarket={activeMarketSlug} />
          <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border">
            सूचीकृत कृषि उपज: <strong className="text-emerald-700">{filteredPrices.length}</strong>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        {marketCategoryPills.map(({ label, count }) => {
          const isActive = activeCategory === label;
          return (
            <Link
              key={label}
              href={`/?market=${activeMarketSlug}&category=${encodeURIComponent(label)}`}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                isActive
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-emerald-800 text-emerald-100" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Price Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/75 border-b text-slate-700 font-semibold">
                <th className="py-3 px-4">कृषि उपज (Commodity)</th>
                <th className="py-3 px-4">वर्ग (Category)</th>
                <th className="py-3 px-4">इकाइ</th>
                <th className="py-3 px-4 text-right">न्यूनतम</th>
                <th className="py-3 px-4 text-right">अधिकतम</th>
                <th className="py-3 px-4 text-right text-emerald-800">औसत मूल्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <Link 
                        href={`/commodity/${item.commodity_code}?market=${activeMarketSlug}`}
                        className="hover:text-emerald-700 flex flex-col"
                      >
                        <span className="font-semibold text-emerald-950 hover:text-emerald-700">{item.commodity_name_ne}</span>
                        <span className="text-xs font-normal text-slate-500">
                          {item.commodity_name_en && item.commodity_name_en !== item.commodity_name_ne ? `${item.commodity_name_en} • ` : ""}
                          {item.category_ne}
                          {!item.commodity_code.startsWith("AMPIS-LIVE-") ? ` (#${item.commodity_code})` : ""} ➔
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.category_ne}</td>
                    <td className="py-3 px-4 text-slate-600">{item.canonical_unit}</td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">
                      रु. {parseFloat(item.min_price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-mono">
                      रु. {parseFloat(item.max_price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                      रु. {parseFloat(item.representative_price).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    यस वर्ग ({activeCategory}) मा यस बजारको लागि आजको मूल्य विवरण उपलब्ध छैन।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}