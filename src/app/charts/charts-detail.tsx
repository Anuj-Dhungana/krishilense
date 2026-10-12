"use client";

import Link from "next/link";
import Image from "next/image";
import { BarChart3, MapPin, Sprout, ArrowUpRight } from "lucide-react";
import { useLanguage, CATEGORY_NE_TO_KEY } from "../../lib/i18n";
import { getCommodityThumbnail } from "../../lib/crop-icons";
import IntelligenceTabs from "../commodity/[code]/intelligence-tabs";

export interface MonthData {
  bs_month: number;
  month_name_ne: string;
  median_price: number;
  spi: number | null;
  delta_spi_pct: number | null;
}

export interface DailyPricePoint {
  date_label: string;
  min_price: number;
  max_price: number;
  rep_price: number;
}

export interface RiskProfileData {
  daily_cv: number | null;
  annual_cv: number | null;
  hcs: number;
  is_high_confidence: boolean;
}

export interface TodayPriceData {
  representativePrice: number;
  minPrice: number;
  maxPrice: number;
  sourceSystem: string;
  sourceLabel: string | null;
}

export interface CommodityDetailData {
  code: string;
  nameNe: string;
  nameEn: string;
  categoryNe: string;
  categoryEn?: string;
  canonicalUnit: string;
  imageUrl?: string | null;
}

export interface MarketDetailData {
  publicSlug: string;
  nameNe: string;
  nameEn: string;
}

interface ChartsDetailProps {
  commodity: CommodityDetailData;
  market: MarketDetailData;
  today: TodayPriceData | null;
  hasSeasonalBaselines: boolean;
  seasonalCurve: MonthData[];
  dailyTrendData: DailyPricePoint[];
  riskProfile: RiskProfileData | null;
}

export default function ChartsDetail({
  commodity,
  market,
  today,
  hasSeasonalBaselines,
  seasonalCurve,
  dailyTrendData,
  riskProfile,
}: ChartsDetailProps) {
  const { t, lang, formatPrice } = useLanguage();

  const commodityName =
    lang === "ne"
      ? commodity.nameNe
      : commodity.nameEn || commodity.nameNe;

  const categoryDisplay =
    lang === "ne"
      ? commodity.categoryNe
      : CATEGORY_NE_TO_KEY[commodity.categoryNe]
      ? t(CATEGORY_NE_TO_KEY[commodity.categoryNe]!)
      : commodity.categoryNe;

  const marketName = lang === "ne" ? market.nameNe : market.nameEn;

  const confidenceLabel = riskProfile
    ? riskProfile.is_high_confidence
      ? t("risk_high_confidence")
      : t("risk_moderate_confidence")
    : undefined;

  const thumbSrc = getCommodityThumbnail(
    commodity.imageUrl,
    commodity.nameNe,
    commodity.categoryNe,
    commodity.code,
    96
  );

  return (
    <div className="space-y-6">
      {/* 1. Commodity Info Banner */}
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center">
            <Image
              src={thumbSrc}
              alt={commodityName}
              width={48}
              height={48}
              unoptimized={thumbSrc.startsWith("data:")}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {commodityName}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                #{commodity.code}
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{categoryDisplay}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                <MapPin className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                {marketName}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link
            href={`/compare?commodity=${encodeURIComponent(commodity.code)}`}
            className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold rounded-xl border border-emerald-200 transition-colors shadow-2xs"
          >
            <BarChart3 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <span>{t("charts_compare_btn")}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 2. Today's Price Snapshot Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-600 font-medium">{t("commodity_avg_today")}</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 font-mono">
            {t("currency")} {today ? formatPrice(today.representativePrice) : "—"}
          </div>
          <span className="text-xs text-slate-600 mt-1 block">
            {t("commodity_unit_per")} {commodity.canonicalUnit}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-600 font-medium">{t("commodity_min_today")}</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
            {t("currency")} {today ? formatPrice(today.minPrice) : "—"}
          </div>
          <span className="text-xs text-slate-600 mt-1 block">{t("commodity_min_desc")}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-600 font-medium">{t("commodity_max_today")}</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-700 mt-1 font-mono">
            {t("currency")} {today ? formatPrice(today.maxPrice) : "—"}
          </div>
          <span className="text-xs text-slate-600 mt-1 block">{t("commodity_max_desc")}</span>
        </div>
      </section>

      {/* 3. Interactive Toggle Tabs Section */}
      <IntelligenceTabs
        cropNameNe={commodity.nameNe}
        cropNameEn={commodity.nameEn}
        canonicalUnit={commodity.canonicalUnit}
        seasonalCurve={seasonalCurve}
        hasSeasonalBaselines={hasSeasonalBaselines}
        confidenceLabel={confidenceLabel}
        dailyTrendData={dailyTrendData}
      />

      {/* 4. Dual Risk Profile Cards */}
      {hasSeasonalBaselines && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-600" aria-hidden="true" />
              {t("risk_daily_volatility")}
            </h3>
            <div className="text-xl font-bold text-amber-600 font-mono">
              {riskProfile?.daily_cv ? `${formatPrice(riskProfile.daily_cv)}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t("risk_daily_desc")}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              {t("risk_annual_variability")}
            </h3>
            <div className="text-xl font-bold text-emerald-700 font-mono">
              {riskProfile?.annual_cv ? `${formatPrice(riskProfile.annual_cv)}%` : "—"}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{t("risk_annual_desc")}</p>
          </div>
        </section>
      )}
    </div>
  );
}
