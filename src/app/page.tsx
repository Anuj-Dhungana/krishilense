import Link from "next/link";
import MarketSelector from "./market-selector";

interface PriceItem {
  id: number;
  commodity_code: string;
  commodity_name_en: string;
  commodity_name_ne: string;
  category_ne: string;
  canonical_unit: string;
  min_price: string;
  max_price: string;
  representative_price: string;
  price_measure_type: string;
}

interface ApiResponse {
  success: boolean;
  market: { name_ne: string; name_en: string; slug: string };
  date: { date_ad: string; bs_date: string } | null;
  total_commodities: number;
  data: PriceItem[];
}

const CATEGORIES = [
  "सबै (All)",
  "तरकारी",
  "फलफूल",
  "मसला बाली",
  "सागपात",
  "च्याउ खेती",
  "कन्दमुल बाली",
  "कोसे / दाल बाली",
  "माछा",
  "अन्य बाली",
];

async function getTodayPrices(marketSlug: string): Promise<ApiResponse | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/prices/today?market=${marketSlug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getMarkets() {
  try {
    const res = await fetch("http://localhost:3000/api/markets", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; category?: string }>;
}) {
  const { market: urlMarket, category: urlCategory } = await searchParams;
  const activeMarketSlug = urlMarket || "kalimati";
  const activeCategory = urlCategory || "सबै (All)";

  const [pricesData, marketsList] = await Promise.all([
    getTodayPrices(activeMarketSlug),
    getMarkets(),
  ]);

  const allPrices = pricesData?.data || [];
  const market = pricesData?.market;
  const dateInfo = pricesData?.date;

  // Filter prices by selected Category
  const filteredPrices = activeCategory === "सबै (All)"
    ? allPrices
    : allPrices.filter((p) => p.category_ne === activeCategory || p.category_ne.includes(activeCategory));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌾</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-800">KrishiLens Nepal</h1>
              <p className="text-xs text-slate-500">कृषि बजार मूल्य सूचना तथा निर्णय प्रणाली</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-medium">
            <Link href="/" className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold">
              दैनिक बजार
            </Link>
            <Link href="/plan" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors">
              🌱 के रोप्ने?
            </Link>
            <Link href="/compare" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors">
              📊 बजार तुलना
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
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
              <span>📍</span> {market?.name_ne || "कृषि थोक बजार"}
            </h3>
            <p className="text-xs text-slate-500">
              तथ्याङ्क मिति: {dateInfo?.bs_date || "आज"} वि.सं. ({dateInfo?.date_ad || ""}) • गणना विधि: थोक दर
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <MarketSelector markets={marketsList} currentMarket={activeMarketSlug} />
            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border">
              सूचीकृत बाली: <strong className="text-emerald-700">{filteredPrices.length}</strong>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Matches AMPIS Categories!) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={`/?market=${activeMarketSlug}&category=${encodeURIComponent(cat)}`}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${
                  isActive
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
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
                            {item.commodity_name_en} (#{item.commodity_code}) ➔
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
    </div>
  );
}