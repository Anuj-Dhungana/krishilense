"use client";

import Link from "next/link";
import { useLanguage, CATEGORY_NE_TO_KEY } from "../../../lib/i18n";
import IntelligenceTabs from "./intelligence-tabs";

interface Props {
  commodity: {
    nameNe: string;
    nameEn: string;
    categoryNe: string;
    code: string;
    canonicalUnit: string;
  };
  market: {
    nameNe: string;
    nameEn: string;
  };
  today: {
    representativePrice: number;
    minPrice: number;
    maxPrice: number;
  } | null;
  hasSeasonalBaselines: boolean;
  seasonalCurve: {
    bs_month: number;
    month_name_ne: string;
    median_price: number;
    spi: number | null;
    delta_spi_pct: number | null;
  }[];
  dailyTrendData: {
    date_label: string;
    min_price: number;
    max_price: number;
    rep_price: number;
  }[];
  riskProfile: {
    daily_cv: number | null;
    annual_cv: number | null;
    hcs: number;
    is_high_confidence: boolean;
  } | null;
}

export default function CommodityPageClient({
  commodity,
  market,
  today,
  hasSeasonalBaselines,
  seasonalCurve,
  dailyTrendData,
  riskProfile,
}: Props) {
  const { t, lang, formatPrice, formatNum } = useLanguage();

  const commodityName = lang === "ne" ? commodity.nameNe : (commodity.nameEn || commodity.nameNe);
  const marketName = lang === "ne" ? market.nameNe : (market.nameEn || market.nameNe);
  const catKey = CATEGORY_NE_TO_KEY[commodity.categoryNe];
  const categoryDisplay = lang === "ne" ? commodity.categoryNe : (catKey ? t(catKey) : commodity.categoryNe);

  const confidenceLabel = riskProfile
    ? riskProfile.is_high_confidence
      ? t("risk_high_confidence")
      : t("risk_moderate_confidence")
    : undefined;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {commodityName}
          </h1>
          <p className="text-slate-500 text-sm">
            {categoryDisplay} • 📍 {marketName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/compare?commodity=${commodity.code}`}
            className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-lg border border-emerald-200 transition-colors"
          >
            {t("commodity_compare_all")}
          </Link>
          <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full font-mono text-slate-600 border">
            #{formatNum(commodity.code)}
          </span>
        </div>
      </div>

      {/* Card 1: Today's Price Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">{t("commodity_avg_today")}</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 font-mono">
            {t("currency")} {today ? formatPrice(today.representativePrice) : "—"}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {t("commodity_unit_per")} {commodity.canonicalUnit}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">{t("commodity_min_today")}</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
            {t("currency")} {today ? formatPrice(today.minPrice) : "—"}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">{t("commodity_min_desc")}</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">{t("commodity_max_today")}</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
            {t("currency")} {today ? formatPrice(today.maxPrice) : "—"}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">{t("commodity_max_desc")}</span>
        </div>
      </div>

      {/* INTERACTIVE TOGGLE TABS SECTION */}
      <IntelligenceTabs
        cropNameNe={commodity.nameNe}
        cropNameEn={commodity.nameEn}
        canonicalUnit={commodity.canonicalUnit}
        seasonalCurve={seasonalCurve}
        hasSeasonalBaselines={hasSeasonalBaselines}
        confidenceLabel={confidenceLabel}
        dailyTrendData={dailyTrendData}
      />

      {/* Card 3: Risk Profile */}
      {hasSeasonalBaselines && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>📊</span> {t("risk_daily_volatility")}
            </h3>
            <div className="text-xl font-bold text-amber-600 font-mono">
              {riskProfile?.daily_cv ? `${formatPrice(riskProfile.daily_cv)}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t("risk_daily_desc")}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>🌱</span> {t("risk_annual_variability")}
            </h3>
            <div className="text-xl font-bold text-emerald-700 font-mono">
              {riskProfile?.annual_cv ? `${formatPrice(riskProfile.annual_cv)}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t("risk_annual_desc")}</p>
          </div>
        </div>
      )}
    </main>
  );
}
