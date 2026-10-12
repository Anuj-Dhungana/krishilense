"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CalendarDays, Info, LineChart } from "lucide-react";
import { useLanguage } from "../../../lib/i18n";
import CropCalendarCard from "./crop-calendar-card";

const SeasonalChart = dynamic(() => import("./seasonal-chart"), {
  loading: () => (
    <div className="h-72 w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">
      चार्ट लोड हुँदैछ...
    </div>
  ),
  ssr: false,
});

const DailyTrendChart = dynamic(() => import("./daily-trend-chart"), {
  loading: () => (
    <div className="h-72 w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">
      दैनिक ट्रेन्ड लोड हुँदैछ...
    </div>
  ),
  ssr: false,
});

interface MonthData {
  bs_month: number;
  month_name_ne: string;
  median_price: number;
  spi: number | null;
  delta_spi_pct: number | null;
}

interface DailyPricePoint {
  date_label: string;
  min_price: number;
  max_price: number;
  rep_price: number;
}

export default function IntelligenceTabs({
  cropNameNe,
  cropNameEn,
  canonicalUnit,
  seasonalCurve,
  hasSeasonalBaselines,
  confidenceLabel,
  dailyTrendData,
}: {
  cropNameNe: string;
  cropNameEn?: string;
  canonicalUnit: string;
  seasonalCurve: MonthData[];
  hasSeasonalBaselines: boolean;
  confidenceLabel?: string;
  dailyTrendData: DailyPricePoint[];
}) {
  const { t, lang, formatCount } = useLanguage();
  const [activeTab, setActiveTab] = useState<"seasonal" | "daily">(
    hasSeasonalBaselines ? "seasonal" : "daily"
  );

  const cropName = lang === "en" ? (cropNameEn || cropNameNe) : cropNameNe;

  return (
    <div className="space-y-6">
      {/* Tab Switcher Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("seasonal")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "seasonal"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="mr-1.5 inline-block h-4 w-4 align-text-bottom" aria-hidden="true" />
            {t("tab_seasonal")}
          </button>

          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "daily"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <LineChart className="mr-1.5 inline-block h-4 w-4 align-text-bottom" aria-hidden="true" />
            {t("tab_daily")}
          </button>
        </div>

        {/* Status Pill */}
        <span className="text-xs px-3 py-1.5 bg-slate-100 rounded-xl text-slate-600 font-medium border hidden md:inline-block">
          {activeTab === "seasonal"
            ? (confidenceLabel || t("tab_seasonal_status"))
            : `${t("tab_daily_status_prefix")} ${formatCount(dailyTrendData.length)} ${t("tab_daily_status_suffix")}`}
        </span>
      </div>

      {/* TAB CONTENT: 1. Seasonal Curve & Crop Calendar */}
      {activeTab === "seasonal" && (
        <div className="space-y-6">
          {hasSeasonalBaselines ? (
            <>
              {/* Seasonal Line Chart Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{t("seasonal_title")}</h2>
                    <p className="text-xs text-slate-500">{t("seasonal_desc")}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-200">
                    {confidenceLabel || t("seasonal_confidence")}
                  </span>
                </div>

                <div className="pt-4">
                  <SeasonalChart data={seasonalCurve} />
                </div>
              </div>

              {/* 12-Month Visual Crop Calendar Grid */}
              <CropCalendarCard data={seasonalCurve} cropNameNe={cropName} />
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <Info className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <h3 className="font-bold text-slate-800 text-sm">{t("seasonal_no_data")}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {t("seasonal_no_data_desc")}
              </p>
              <button
                onClick={() => setActiveTab("daily")}
                className="inline-block px-4 py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <LineChart className="mr-1.5 inline-block h-4 w-4 align-text-bottom" aria-hidden="true" />
                {t("seasonal_view_daily_btn")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. Daily Price Fluctuation Trend */}
      {activeTab === "daily" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <LineChart className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              {t("daily_title")}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t("daily_desc")}</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-800 font-medium rounded-lg border border-teal-200">
              {t("daily_trend_badge")}
            </span>
          </div>

          <div className="pt-2">
            <DailyTrendChart data={dailyTrendData} unit={canonicalUnit} />
          </div>

          {/* Notice Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span>
              <strong>{t("daily_notice_label")}</strong> {t("daily_notice")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}