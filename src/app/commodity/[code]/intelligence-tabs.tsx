"use client";

import { useState } from "react";
import SeasonalChart from "./seasonal-chart";
import CropCalendarCard from "./crop-calendar-card";
import DailyTrendChart from "./daily-trend-chart";

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
  canonicalUnit,
  seasonalCurve,
  hasSeasonalBaselines,
  confidenceLabel,
  dailyTrendData,
}: {
  cropNameNe: string;
  canonicalUnit: string;
  seasonalCurve: MonthData[];
  hasSeasonalBaselines: boolean;
  confidenceLabel?: string;
  dailyTrendData: DailyPricePoint[];
}) {
  // Default to seasonal if available, otherwise daily
  const [activeTab, setActiveTab] = useState<"seasonal" | "daily">(
    hasSeasonalBaselines ? "seasonal" : "daily"
  );

  return (
    <div className="space-y-6">
      {/* Tab Switcher Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Tab 1: Seasonal */}
          <button
            onClick={() => setActiveTab("seasonal")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "seasonal"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            📅 १२ महिनाको मौसमी चक्र (12-Month Seasonal)
          </button>

          {/* Tab 2: Daily */}
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "daily"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            📈 दैनिक मूल्य उतारचढाव (Daily Price Trend)
          </button>
        </div>

        {/* Status Pill */}
        <span className="text-xs px-3 py-1.5 bg-slate-100 rounded-xl text-slate-600 font-medium border hidden md:inline-block">
          {activeTab === "seasonal"
            ? (confidenceLabel || "१० वर्षे ऐतिहासिक आधार")
            : `पछिल्लो ${dailyTrendData.length} दिनको कारोबार`}
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
                    <h2 className="text-lg font-bold text-slate-900">
                      १२ महिनाको ऐतिहासिक मौसमी चक्र (12-Month Seasonal Pattern)
                    </h2>
                    <p className="text-xs text-slate-500">
                      विगत १० वर्षको वास्तविक कारोबारको मासिक औसत मूल्य प्रवृत्तिको आधारमा
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-200">
                    {confidenceLabel || "१० वर्षे तथ्याङ्क"}
                  </span>
                </div>

                <div className="pt-4">
                  <SeasonalChart data={seasonalCurve} />
                </div>
              </div>

              {/* 12-Month Visual Crop Calendar Grid */}
              <CropCalendarCard data={seasonalCurve} cropNameNe={cropNameNe} />
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <span className="text-3xl">ℹ️</span>
              <h3 className="font-bold text-slate-800 text-sm">
                यस वस्तुको १० वर्षे दीर्घकालीन मौसमी चक्र तथ्याङ्क उपलब्ध छैन
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                यो वस्तु कालिमाटीको ऐतिहासिक फलफूल तथा तरकारी बोर्डमा समावेश नभएको वा नयाँ सूचीकृत भएको कारण १० वर्षे मौसमी चक्र उपलब्ध छैन।
              </p>
              <button
                onClick={() => setActiveTab("daily")}
                className="inline-block px-4 py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                📈 हालैको दैनिक मूल्य उतारचढाव हेर्नुहोस् ➔
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
                <span>📈</span> हालैको दैनिक मूल्य उतारचढाव (Daily Price Fluctuation Trend)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                विगतका कारोबार दिनहरूको दैनिक मूल्य घटबढ (न्यूनतम, औसत र अधिकतम दर)
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-teal-50 text-teal-800 font-medium rounded-lg border border-teal-200">
              दैनिक बजार ट्रेन्ड
            </span>
          </div>

          {/* Daily Price Chart */}
          <div className="pt-2">
            <DailyTrendChart data={dailyTrendData} unit={canonicalUnit} />
          </div>

          {/* Notice Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed flex items-start gap-2">
            <span className="text-sm">ℹ</span>
            <span>
              <strong>सूचना:</strong> दैनिक हरियो रेखाले प्रतिनिधि औसत दर र डटेड रेखाले न्यूनतम/अधिकतम मूल्यको ब्यान्ड देखाउँछ।
            </span>
          </div>
        </div>
      )}
    </div>
  );
}