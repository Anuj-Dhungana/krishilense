"use client";

import { useState } from "react";
import { useLanguage } from "../../lib/i18n";

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

// Month IDs for use with translation keys
const BS_MONTH_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
type MonthId = (typeof BS_MONTH_IDS)[number];

export default function PlanPage() {
  const { t, lang, formatPrice, formatPct, formatNum } = useLanguage();

  const [district, setDistrict] = useState("jhapa");
  const [irrigation, setIrrigation] = useState("IRRIGATED");
  const [month, setMonth] = useState("6"); // Default Ashwin
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlanResults | null>(null);

  // Build month list from translations
  const BS_MONTHS = BS_MONTH_IDS.map((id) => ({
    id,
    name: t(`bs_month_${id}` as Parameters<typeof t>[0]),
  }));

  function getMonthName(id: number): string {
    return t(`bs_month_${id}` as Parameters<typeof t>[0]);
  }

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

  function renderCropCard(
    item: RecommendedCrop,
    badgeColor: string,
    badgeText: string,
    index: number
  ) {
    const harvestMonthName = getMonthName(item.expectedHarvestMonth) || `${t("month_label")} ${item.expectedHarvestMonth}`;
    const cropName = lang === "en" ? (item.cropNameEn || item.cropNameNe) : item.cropNameNe;

    return (
      <div
        key={`${item.commodityCode}-${item.varietyNameNe}-${index}`}
        className="bg-white border rounded-2xl p-5 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h4 className="text-xl font-bold text-slate-900">
              {cropName}{" "}
              <span className="text-sm font-normal text-slate-500">({item.varietyNameNe})</span>
            </h4>
            <span className="text-xs text-slate-500">
              {t("crop_duration")} {formatNum(item.maturityDaysRange[0])}–{formatNum(item.maturityDaysRange[1])} {t("crop_days")} •{" "}
              {t("crop_code")} #{formatNum(item.commodityCode)}
            </span>
          </div>
          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">{t("crop_harvest_time")}</span>
            <div className="font-bold text-slate-800 mt-0.5">{harvestMonthName}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">{t("crop_historical_price")}</span>
            <div className="font-bold text-emerald-700 font-mono mt-0.5">
              {t("currency")} {formatPrice(item.historicalMedianPrice)}/{item.canonicalUnit}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">{t("crop_seasonal_advantage")}</span>
            <div className="font-bold text-emerald-700 mt-0.5">
              {formatPct(item.seasonalAdvantagePct)}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="text-xs text-slate-500">{t("crop_daily_volatility")}</span>
            <div className="font-bold text-amber-600 mt-0.5 font-mono">
              {item.dailyVolatilityPct != null ? `${formatPrice(item.dailyVolatilityPct)}%` : "—"}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed">
          <strong>{t("crop_why_recommended")}</strong> {item.explanationNe}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t("plan_title")}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{t("plan_desc")}</p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* District */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("plan_label_district")}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <optgroup label={t("province_koshi")}>
                <option value="jhapa">{t("dist_jhapa")} ({t("zone_terai")})</option>
                <option value="sunsari">{t("dist_sunsari")} ({t("zone_terai")})</option>
              </optgroup>
              <optgroup label={t("province_madhesh")}>
                <option value="dhanusha">{t("dist_dhanusha")} ({t("zone_terai")})</option>
                <option value="sarlahi">{t("dist_sarlahi")} ({t("zone_terai")})</option>
              </optgroup>
              <optgroup label={t("province_bagmati")}>
                <option value="kathmandu">{t("dist_kathmandu")} ({t("zone_valley")})</option>
                <option value="sindhuli">{t("dist_sindhuli")} ({t("zone_inner_hills")})</option>
              </optgroup>
              <optgroup label={t("province_gandaki")}>
                <option value="kaski">{t("dist_kaski")} ({t("zone_mid_hills")})</option>
                <option value="nawalpur">{t("dist_nawalpur")} ({t("zone_terai")})</option>
              </optgroup>
              <optgroup label={t("province_lumbini")}>
                <option value="rupondehi">{t("dist_rupondehi")} ({t("zone_terai")})</option>
                <option value="banke">{t("dist_banke")} ({t("zone_terai")})</option>
              </optgroup>
              <optgroup label={t("province_karnali")}>
                <option value="surkhet">{t("dist_surkhet")} ({t("zone_inner_hills")})</option>
              </optgroup>
              <optgroup label={t("province_sudurpashchim")}>
                <option value="kailali">{t("dist_kailali")} ({t("zone_terai")})</option>
              </optgroup>
            </select>
          </div>

          {/* Irrigation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("plan_label_irrigation")}
            </label>
            <select
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="IRRIGATED">{t("plan_irrigated")}</option>
              <option value="SEMI_IRRIGATED">{t("plan_semi_irrigated")}</option>
              <option value="RAINFED">{t("plan_rainfed")}</option>
            </select>
          </div>

          {/* Planting Month */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("plan_label_month")}
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
          {loading ? t("plan_analyzing") : t("plan_analyze_btn")}
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 pt-2">
          <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {t("plan_results_title")} ({results.context.district} •{" "}
              {getMonthName(results.context.plantingMonth)})
            </h2>
            <span className="text-xs text-slate-500">{t("plan_results_note")}</span>
          </div>

          {/* Cohort A */}
          {results.cohort_a?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="font-bold text-emerald-900 text-sm">{t("cohort_a_title")}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.cohort_a.map((item, i) =>
                  renderCropCard(item, "bg-emerald-100 text-emerald-800", t("cohort_a_badge"), i)
                )}
              </div>
            </div>
          )}

          {/* Cohort B */}
          {results.cohort_b?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <h3 className="font-bold text-teal-900 text-sm">{t("cohort_b_title")}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.cohort_b.map((item, i) =>
                  renderCropCard(item, "bg-teal-100 text-teal-800", t("cohort_b_badge"), i)
                )}
              </div>
            </div>
          )}

          {/* Cohort C */}
          {results.cohort_c?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <h3 className="font-bold text-amber-900 text-sm">{t("cohort_c_title")}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {results.cohort_c.map((item, i) =>
                  renderCropCard(item, "bg-amber-100 text-amber-800", t("cohort_c_badge"), i)
                )}
              </div>
            </div>
          )}

          {/* Cohort D */}
          {results.cohort_d?.length > 0 && (
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t("cohort_d_title")}
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

          {/* No Recommendations */}
          {!results.hasRecommendations && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
              <h3 className="font-bold text-amber-900">{t("plan_no_results_title")}</h3>
              <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                {t("plan_no_results_desc")}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}