import Link from "next/link";

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

async function getTodayPrices(): Promise<ApiResponse | null> {
  try {
    const res = await fetch("http://localhost:3000/api/prices/today?market=kalimati", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const result = await getTodayPrices();
  const prices = result?.data || [];
  const market = result?.market;
  const dateInfo = result?.date;

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
          <div className="flex items-center space-x-3 text-sm">
            <span className="hidden sm:inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium border border-emerald-200">
              🟢 आजको बजार सक्रिय
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
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
              नेपालका प्रमुख कृषि थोक बजारहरूको दैनिक मूल्य, ऐतिहासिक मौसमी चक्र र बाली योजना निर्णय प्रणाली।
            </p>
          </div>
        </section>

        {/* Market Board Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span>📍</span> {market?.name_ne || "कालिमाटी फलफूल तथा तरकारी बजार"}
              </h3>
              <p className="text-xs text-slate-500">
                तथ्याङ्क मिति: {dateInfo?.bs_date || "आज"} वि.सं. ({dateInfo?.date_ad || ""}) • गणना विधि: अंकगणितीय औसत
              </p>
            </div>
            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border">
              कुल सूचीकृत बाली: <strong className="text-emerald-700">{prices.length}</strong>
            </div>
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
                  {prices.length > 0 ? (
                    prices.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <Link
                            href={`/commodity/${item.commodity_code}`}
                            className="hover:text-emerald-700 hover:underline flex flex-col"
                          >
                            <span className="font-semibold text-emerald-950 hover:text-emerald-700">
                              {item.commodity_name_ne}
                            </span>
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
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        अहिले मूल्य विवरण उपलब्ध छैन। कृपया पछि हेर्नुहोस्।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer Notice */}
        <footer className="text-center text-xs text-slate-500 border-t pt-4">
          <p>
            स्रोत: कृषि बजार मूल्य सूचना प्रणाली (AMPIS) र कालिमाटी फलफूल तथा तरकारी बजार विकास बोर्ड • KrishiLens Nepal Research
          </p>
        </footer>
      </main>
    </div>
  );
}