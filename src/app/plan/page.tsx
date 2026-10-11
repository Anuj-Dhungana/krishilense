"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  Droplets,
  Lightbulb,
  MapPin,
  Sprout,
  Star,
  TrendingUp,
  Wheat,
} from "lucide-react";
import { useLanguage } from "../../lib/i18n";
import { getCropIconUrl, getCommodityThumbnail } from "../../lib/crop-icons";

interface RecommendedCrop {
  cropNameEn: string;
  cropNameNe: string;
  varietyNameNe: string;
  commodityCode: string;
  canonicalUnit: string;
  imageUrl?: string | null;
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
  commodityCode?: string;
  imageUrl?: string | null;
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

    const isNegative = item.seasonalAdvantagePct != null && item.seasonalAdvantagePct < 0;
    return (
      <article
        key={`${item.commodityCode}-${item.varietyNameNe}-${index}`}
        className="overflow-hidden rounded-2xl border border-[#DCEBE4] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-56 shrink-0 bg-emerald-50 sm:h-auto sm:w-56 overflow-hidden">
            {(() => {
              const thumbSrc = getCommodityThumbnail(item.imageUrl, item.cropNameNe, item.varietyNameNe, item.commodityCode, 224);
              return (
                <Image
                  src={thumbSrc}
                  alt={cropName}
                  width={224}
                  height={224}
                  unoptimized={thumbSrc.startsWith("data:")}
                  className="h-full min-h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              );
            })()}
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-4 p-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#DCEBE4] pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#16352F]">
                  {cropName} <span className="text-sm font-normal text-slate-500">({item.varietyNameNe})</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {t("crop_duration")} {formatNum(item.maturityDaysRange[0])}–{formatNum(item.maturityDaysRange[1])} {t("crop_days")}
                </span>
              </div>
              <Wheat className="hidden h-5 w-5 shrink-0 text-emerald-700 sm:block" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
              <div className="rounded-xl border border-[#DCEBE4] bg-[#F8FBF8] p-3">
                <CalendarDays className="mb-2 h-4 w-4 text-emerald-700" aria-hidden="true" />
                <span className="block text-[10px] text-slate-500">{t("crop_harvest_time")}</span>
                <div className="mt-0.5 font-bold text-[#16352F]">{harvestMonthName}</div>
              </div>
              <div className="rounded-xl border border-[#DCEBE4] bg-[#F8FBF8] p-3">
                <Wheat className="mb-2 h-4 w-4 text-emerald-700" aria-hidden="true" />
                <span className="block text-[10px] text-slate-500">{t("crop_historical_price")}</span>
                <div className="mt-0.5 font-mono font-bold text-emerald-700">
                  {t("currency")} {formatPrice(item.historicalMedianPrice)}/{item.canonicalUnit}
                </div>
              </div>
              <div className={`rounded-xl border p-3 ${isNegative ? "border-red-100 bg-red-50/50" : "border-[#DCEBE4] bg-[#F8FBF8]"}`}>
                <TrendingUp className={`mb-2 h-4 w-4 ${isNegative ? "text-red-500" : "text-emerald-700"}`} aria-hidden="true" />
                <span className="block text-[10px] text-slate-500">{t("crop_seasonal_advantage")}</span>
                <div className={`mt-0.5 font-bold ${isNegative ? "text-red-500" : "text-emerald-700"}`}>
                  {formatPct(item.seasonalAdvantagePct)}
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                <Activity className="mb-2 h-4 w-4 text-amber-600" aria-hidden="true" />
                <span className="block text-[10px] text-slate-500">{t("crop_daily_volatility")}</span>
                <div className="mt-0.5 font-mono font-bold text-amber-600">
                  {item.dailyVolatilityPct != null ? `${formatPrice(item.dailyVolatilityPct)}%` : "—"}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3.5 text-xs leading-relaxed text-slate-700">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <p><strong className="text-emerald-900">{t("crop_why_recommended")}</strong> {item.explanationNe}</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const topRecommendation = results?.cohort_a[0] || results?.cohort_b[0] || results?.cohort_c[0];
  const topRecommendationName = topRecommendation
    ? lang === "en" ? (topRecommendation.cropNameEn || topRecommendation.cropNameNe) : topRecommendation.cropNameNe
    : null;

  return (
    <main className="min-h-screen bg-[#F8FBF8] text-[#16352F]">
      <section className="relative overflow-visible">
        <div
          className="relative min-h-[330px] bg-cover bg-center"
          style={{ backgroundImage: "url('/banner-what-to-grow.webp')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10" />
          <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                <Sprout className="h-4 w-4" aria-hidden="true" />
                {lang === "en" ? "Smarter Farming · Better Income" : "स्मार्ट खेती · राम्रो आम्दानी"}
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#16352F] sm:text-5xl">
                {lang === "en" ? <>What Should I Grow <span className="text-emerald-700">This Season?</span></> : t("plan_title")}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">{t("plan_desc")}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#DCEBE4] bg-white p-4 shadow-lg sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {/* District */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              {t("plan_label_district")}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-[#DCEBE4] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Droplets className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              {t("plan_label_irrigation")}
            </label>
            <select
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value)}
              className="w-full rounded-xl border border-[#DCEBE4] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="IRRIGATED">{t("plan_irrigated")}</option>
              <option value="SEMI_IRRIGATED">{t("plan_semi_irrigated")}</option>
              <option value="RAINFED">{t("plan_rainfed")}</option>
            </select>
          </div>

          {/* Planting Month */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <CalendarDays className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              {t("plan_label_month")}
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl border border-[#DCEBE4] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {BS_MONTHS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
            <button
          onClick={handleAnalyze}
          disabled={loading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#064E3B] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-wait disabled:opacity-60"
            >
              <Sprout className="h-4 w-4" aria-hidden="true" />
              {loading ? t("plan_analyzing") : t("plan_analyze_btn")}
              {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-12 sm:px-6 lg:px-8">

      {/* Results Section */}
      {results && (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col justify-between gap-4 border-b border-[#DCEBE4] pb-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                <Sprout className="mr-1 inline h-4 w-4" aria-hidden="true" />
                {t("plan_results_title")}
              </p>
              <h2 className="text-2xl font-extrabold text-[#16352F]">
                {results.context.district} · {getMonthName(results.context.plantingMonth)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {lang === "en" ? "Based on your selected location, irrigation status and planting month." : "तपाईंको स्थान, सिँचाइ र रोप्ने महिनाका आधारमा।"}
              </p>
            </div>
            <p className="max-w-sm text-xs leading-5 text-slate-500 lg:text-right">{t("plan_results_note")}</p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            {topRecommendation?.imageUrl ? (() => {
              const thumbSrc = getCommodityThumbnail(topRecommendation.imageUrl, topRecommendation.cropNameNe, topRecommendation.varietyNameNe, topRecommendation.commodityCode, 96);
              return (
                <Image
                  src={thumbSrc}
                  alt={topRecommendationName || ""}
                  width={40}
                  height={40}
                  unoptimized={thumbSrc.startsWith("data:")}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover border border-emerald-200"
                />
              );
            })() : (
              <Star className="h-5 w-5 shrink-0 fill-emerald-600 text-emerald-600" aria-hidden="true" />
            )}
            <div>
              <strong className="mr-2">{lang === "en" ? "Best Opportunity" : "उत्कृष्ट अवसर"}</strong>
              {topRecommendationName
                ? (lang === "en" ? `${topRecommendationName} appears strongest for this season.` : `${topRecommendationName} यस सिजनका लागि बलियो सिफारिस देखिन्छ।`)
                : (lang === "en" ? "Suitable crops are shown below based on the available analysis." : "उपलब्ध विश्लेषणका आधारमा उपयुक्त बालीहरू तल देखाइएको छ।")}
            </div>
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
            <div className="space-y-3 rounded-2xl border border-[#DCEBE4] bg-emerald-50/50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <Sprout className="h-4 w-4" aria-hidden="true" />
                {t("cohort_d_title")}
              </h3>
              <p className="text-xs text-slate-600">
                {lang === "en" ? "Insufficient market data is available to estimate these opportunities reliably." : "यी बालीहरूको अवसर विश्वसनीय रूपमा अनुमान गर्न पर्याप्त बजार तथ्याङ्क उपलब्ध छैन।"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {results.cohort_d.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-[#DCEBE4] bg-white p-3 shadow-xs">
                    {(() => {
                      const thumbSrc = getCommodityThumbnail(d.imageUrl, d.cropNameNe, d.varietyNameNe, d.commodityCode || "", 96);
                      return (
                        <Image
                          src={thumbSrc}
                          alt={d.cropNameNe}
                          width={48}
                          height={48}
                          unoptimized={thumbSrc.startsWith("data:")}
                          className="h-12 w-12 shrink-0 rounded-lg object-cover bg-emerald-50"
                        />
                      );
                    })()}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{d.cropNameNe}</p>
                      <p className="truncate text-[11px] text-slate-500">{d.varietyNameNe}</p>
                      <p className="truncate text-[10px] text-slate-600 italic">{d.reason}</p>
                    </div>
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
      </section>
    </main>
  );
}