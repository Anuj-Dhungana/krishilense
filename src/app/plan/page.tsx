"use client";

import { useState } from "react";

interface RecommendedCrop {
  cropNameEn: string;
  cropNameNe: string;
  varietyNameNe: string;
  commodityCode: string;
  canonicalUnit: string;
  maturityDaysRange: [number, number];
  expectedHarvestMonth: number;
  historicalMedianPrice: number;
  seasonalAdvantagePct: number | null;
  dailyVolatilityPct: number | null;
  annualVariabilityPct: number | null;
  confidenceScore: number;
  confidenceTierNe: string;
  explanationNe: string;
}

interface InsufficientDataCrop {
  cropNameNe: string;
  varietyNameNe: string;
  reason: string;
}

interface PlanResults {
  context: {
    district: string;
    plantingMonth: number;
    elevationMeters: number;
    agroZone: string;
    irrigationStatus: string;
  };
  cohort_a: RecommendedCrop[];
  cohort_b: RecommendedCrop[];
  cohort_c: RecommendedCrop[];
  cohort_d: InsufficientDataCrop[];
  hasRecommendations: boolean;
}

const BS_MONTHS = [
  { id: 1, name: "बैशाख (Baisakh)" },
  { id: 2, name: "जेठ (Jestha)" },
  { id: 3, name: "असार (Ashad)" },
  { id: 4, name: "साउन (Shrawan)" },
  { id: 5, name: "भदौ (Bhadra)" },
  { id: 6, name: "असोज (Ashwin)" },
  { id: 7, name: "कार्तिक (Kartik)" },
  { id: 8, name: "मंसिर (Mangsir)" },
  { id: 9, name: "पुस (Poush)" },
  { id: 10, name: "माघ (Magh)" },
  { id: 11, name: "फागुन (Falgun)" },
  { id: 12, name: "चैत (Chaitra)" },
];

export default function PlanPage() {
  const [district, setDistrict] = useState("jhapa");
  const [irrigation, setIrrigation] = useState("IRRIGATED");
  const [month, setMonth] = useState("6"); // Default Ashwin
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlanResults | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district_slug: district,
          irrigation_status: irrigation,
          planting_month: month,
        }),
      });
      const data: PlanResults = await res.json();
      setResults(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function renderCropCard(item: RecommendedCrop, badgeColor: string, badgeText: string, index: number) {
    const harvestMonthName = BS_MONTHS.find((m) => m.id === item.expectedHarvestMonth)?.name.split(" ")[0] || `महिना ${item.expectedHarvestMonth}`;

    return (
      <div key={`${item.commodityCode}-${item.varietyNameNe}-${index}`} className="bg-white border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h4 className="text-xl font-bold text-slate-900">
              {item.cropNameNe} <span className="text-sm font-normal text-slate-500">({item.varietyNameNe})</span>
            </h4>
            <span className="text-xs text-slate-500">
              बाली अवधि: {item.maturityDaysRange[0]}–{item.maturityDaysRange[1]} दिन • कोड: #{item.commodityCode}
            </span>
          </div>
          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">अनुमानित उत्पादन समय</span>
            <div className="font-bold text-slate-800 mt-0.5">{harvestMonthName}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">ऐतिहासिक औसत मूल्य</span>
            <div className="font-bold text-emerald-700 font-mono mt-0.5">
              रु. {item.historicalMedianPrice.toFixed(2)}/{item.canonicalUnit}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">मौसमी मूल्य फाइदा</span>
            <div className="font-bold text-emerald-700 mt-0.5">
              {item.seasonalAdvantagePct ? `+${item.seasonalAdvantagePct}%` : "—"}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">दैनिक उतारचढाव</span>
            <div className="font-bold text-amber-600 mt-0.5 font-mono">
              {item.dailyVolatilityPct ? `${item.dailyVolatilityPct}%` : "—"}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed">
          <strong>किन सिफारिस गरियो?</strong> {item.explanationNe}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          यस पटक कुन बाली लगाउने? (What Should I Grow?)
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          तपाईंको ठेगाना, सिँचाइको अवस्था र रोप्ने महिना अनुसार AITC आधिकारिक क्यालेन्डर र १० वर्षे बजार प्रवृत्तिको आधारमा बाली सिफारिस।
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              १. जिल्ला छान्नुहोस् (District)
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <optgroup label="कोशी प्रदेश (Koshi)">
                <option value="jhapa">झापा (Jhapa - तराई)</option>
                <option value="sunsari">सुनसरी (Sunsari - तराई)</option>
              </optgroup>
              <optgroup label="मधेश प्रदेश (Madhesh)">
                <option value="dhanusha">धनुषा (Dhanusha - तराई)</option>
                <option value="sarlahi">सर्लाही (Sarlahi - तराई)</option>
              </optgroup>
              <optgroup label="बागमती प्रदेश (Bagmati)">
                <option value="kathmandu">काठमाडौं (Kathmandu - उपत्यका)</option>
                <option value="sindhuli">सिन्धुली (Sindhuli - भित्री पहाड)</option>
              </optgroup>
              <optgroup label="गण्डकी प्रदेश (Gandaki)">
                <option value="kaski">कास्की (Kaski - मध्यपहाड)</option>
                <option value="nawalpur">नवलपुर (Nawalpur - तराई)</option>
              </optgroup>
              <optgroup label="लुम्बिनी प्रदेश (Lumbini)">
                <option value="rupondehi">रुपन्देही (Rupandehi - तराई)</option>
                <option value="banke">बाँके (Banke - तराई)</option>
              </optgroup>
              <optgroup label="कर्णाली प्रदेश (Karnali)">
                <option value="surkhet">सुर्खेत (Surkhet - भित्री पहाड)</option>
              </optgroup>
              <optgroup label="सुदूरपश्चिम प्रदेश (Sudurpashchim)">
                <option value="kailali">कैलाली (Kailali - तराई)</option>
              </optgroup>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              २. सिँचाइको सुविधा (Irrigation)
            </label>
            <select
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="IRRIGATED">पर्याप्त सिँचाइ (Irrigated)</option>
              <option value="SEMI_IRRIGATED">आंशिक सिँचाइ (Semi-Irrigated)</option>
              <option value="RAINFED">आकाशे पानीको भर (Rainfed)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ३. बाली रोप्ने महिना (Planting Month)
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {BS_MONTHS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs disabled:opacity-50"
        >
          {loading ? "विश्लेषण गर्दैछ..." : "अवसर विश्लेषण गर्नुहोस् (Analyze Opportunities) ➔"}
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 pt-2">
          <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              विश्लेषण नतिजा ({results.context.district} • महिना: {BS_MONTHS.find(m => m.id === results.context.plantingMonth)?.name.split(" ")[0]})
            </h2>
            <span className="text-xs text-slate-500">
              *कालिमाटी राष्ट्रिय थोक बजारको १० वर्षे ऐतिहासिक आधारमा विश्लेषित
            </span>
          </div>

          {/* Cohort A: Optimal + Strong Evidence */}
          {results.cohort_a?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="font-bold text-emerald-900 text-sm">
                  {"समूह 'क': उत्कृष्ट अनुकूलता + बलियो ऐतिहासिक प्रमाण (Optimal Agronomy + High Confidence)"}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.cohort_a.map((item, i) => renderCropCard(item, "bg-emerald-100 text-emerald-800", "🟢 उत्कृष्ट अवसर", i))}
              </div>
            </div>
          )}

          {/* Cohort B: Optimal + Moderate/Preliminary Evidence */}
          {results.cohort_b?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <h3 className="font-bold text-teal-900 text-sm">
                  {"समूह 'ख': उत्कृष्ट अनुकूलता + मध्यम प्रमाण (Optimal Agronomy + Moderate Evidence)"}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.cohort_b.map((item, i) => renderCropCard(item, "bg-teal-100 text-teal-800", "🔵 राम्रो अवसर", i))}
              </div>
            </div>
          )}

          {/* Cohort C: Conditional Agronomy */}
          {results.cohort_c?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <h3 className="font-bold text-amber-900 text-sm">
                  {"समूह 'ग': सर्तसहित कृषि अनुकूलता (Conditional Agronomy)"}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.cohort_c.map((item, i) => renderCropCard(item, "bg-amber-100 text-amber-800", "🟡 सर्तसहित उपयुक्त", i))}
              </div>
            </div>
          )}

          {/* Cohort D: Insufficient Data Accordion */}
          {results.cohort_d?.length > 0 && (
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                अन्य उपयुक्त बालीहरू (तर बजार तथ्याङ्क अपर्याप्त रहेको)
              </h4>
              <div className="divide-y divide-slate-200 text-xs">
                {results.cohort_d.map((d, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-slate-700">
                    <span>• {d.cropNameNe} ({d.varietyNameNe})</span>
                    <span className="text-slate-500 italic">{d.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No recommendations fallback */}
          {!results.hasRecommendations && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
              <h3 className="font-bold text-amber-900">
                छनोट गरिएको महिनामा उपयुक्त सिफारिस भेटिएन
              </h3>
              <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                तपाईंले छान्नुभएको स्थान वा महिनामा बालीहरू सिजन बाहिर पर्छन् वा पानीको अभाव हुन सक्छ। कृपया अर्को महिना (उदा. असोज, कार्तिक वा फागुन) छनोट गरी हेर्नुहोस्।
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}