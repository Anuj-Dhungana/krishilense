import Link from "next/link";
import SeasonalChart from "./seasonal-chart";

async function getIntelligence(code: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/commodities/${code}/intelligence?market=kalimati`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CommodityPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getIntelligence(code);

  if (!data || !data.success) {
    return (
      <div className="min-h-screen p-8 text-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">बाली फेला परेन (Commodity Not Found)</h2>
        <Link href="/" className="text-emerald-700 underline mt-4 inline-block">
          ← गृहपृष्ठमा फर्कनुहोस् (Back to Home)
        </Link>
      </div>
    );
  }

  const { commodity, market, today, seasonal_curve, risk_profile } = data;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
            ← गृहपृष्ठ (Home)
          </Link>
          <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full font-mono text-slate-600 border">
            कोड: #{commodity.code}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {commodity.nameNe}
            </h1>
            <p className="text-slate-500 text-sm">
              {commodity.nameEn} • {commodity.categoryNe} • बजार: {market.nameNe}
            </p>
          </div>
          <div className="text-sm text-slate-500">
            इकाइ: <strong className="text-slate-800">{commodity.canonicalUnit}</strong>
          </div>
        </div>

        {/* Card 1: Today's Price Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">आजको औसत मूल्य (Average)</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 font-mono">
              रु. {today ? parseFloat(today.representativePrice).toFixed(2) : "—"}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">गणना विधि: मध्यविन्दु</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">न्यूनतम मूल्य (Minimum)</span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
              रु. {today ? parseFloat(today.minPrice).toFixed(2) : "—"}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">बिहानको सुरुवाती मूल्य</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">अधिकतम मूल्य (Maximum)</span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
              रु. {today ? parseFloat(today.maxPrice).toFixed(2) : "—"}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">उच्चतम कारोबार मूल्य</span>
          </div>
        </div>

        {/* Card 2: 12-Month Bikram Sambat Seasonal Curve */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                १२ महिनाको ऐतिहासिक मौसमी चक्र (12-Month Seasonal Pattern)
              </h2>
              <p className="text-xs text-slate-500">
                विगत ४ वर्ष (२०७९–२०८२ वि.सं.) को मासिक औसत मूल्य प्रवृत्तिको आधारमा
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded border border-emerald-200">
              {risk_profile?.confidence_label || "ऐतिहासिक तथ्याङ्क"}
            </span>
          </div>

          {/* Interactive Chart Component */}
          <div className="pt-4">
            <SeasonalChart data={seasonal_curve} />
          </div>
        </div>

        {/* Card 3: Risk & Volatility Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>📊</span> दैनिक मूल्य उतारचढाव (Daily Volatility)
            </h3>
            <div className="text-xl font-bold text-amber-600 font-mono">
              {risk_profile?.daily_cv ? `${risk_profile.daily_cv}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              दैनिक बजारमा मूल्य केही मात्रामा घटबढ भइरहन्छ (मध्यम उतारचढाव)।
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>🌱</span> वर्षगत उत्पादन स्थिरता (Annual Variability)
            </h3>
            <div className="text-xl font-bold text-emerald-700 font-mono">
              {risk_profile?.annual_cv ? `${risk_profile.annual_cv}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              प्रत्येक वर्ष यस सिजनको औसत मूल्य तुलनात्मक रूपमा स्थिर रहने गरेको देखिन्छ।
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}