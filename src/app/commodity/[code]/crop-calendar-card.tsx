"use client";

import { CalendarDays } from "lucide-react";
import { useLanguage } from "../../../lib/i18n";

interface MonthOpportunity {
  bs_month: number;
  month_name_ne: string;
  median_price: number;
  delta_spi_pct: number | null;
}

export default function CropCalendarCard({
  data,
  cropNameNe,
}: {
  data: MonthOpportunity[];
  cropNameNe: string;
}) {
  const { t, lang, formatPrice, formatPct } = useLanguage();

  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.median_price - a.median_price);
  const highestMonth = sorted[0];
  const lowestMonth = sorted[sorted.length - 1];

  // Get translated month name
  function getMonthName(monthNe: string, bsMonth: number): string {
    return t(`bs_month_${bsMonth}` as Parameters<typeof t>[0]);
  }

  const highestMonthName = getMonthName(highestMonth.month_name_ne, highestMonth.bs_month);
  const lowestMonthName = getMonthName(lowestMonth.month_name_ne, lowestMonth.bs_month);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            {t("calendar_title")}
          </h2>
          <p className="text-xs text-slate-500">{t("calendar_desc")}</p>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium">
            {t("calendar_highest")} {highestMonthName} ({t("currency")} {formatPrice(highestMonth.median_price)})
          </span>
          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 font-medium">
            {t("calendar_cheapest")} {lowestMonthName} ({t("currency")} {formatPrice(lowestMonth.median_price)})
          </span>
        </div>
      </div>

      {/* 12-Month Calendar Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {data.map((item) => {
          const delta = item.delta_spi_pct ?? 0;
          const isHigh = delta > 15;
          const isLow = delta < -15;
          const monthName = getMonthName(item.month_name_ne, item.bs_month);

          return (
            <div
              key={item.bs_month}
              className={`p-3 rounded-xl border text-center flex flex-col justify-between space-y-2 transition-all ${
                isHigh
                  ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/30"
                  : isLow
                  ? "bg-rose-50/60 border-rose-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="text-xs font-bold text-slate-800">{monthName}</span>

              <div className="font-mono text-xs font-bold text-slate-900">
                {t("currency")} {formatPrice(item.median_price, 0)}
              </div>

              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full block ${
                  isHigh
                    ? "bg-emerald-600 text-white"
                    : isLow
                    ? "bg-rose-100 text-rose-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {isHigh ? t("calendar_high_price") : isLow ? t("calendar_cheap_market") : t("calendar_normal")}
              </span>

              <span className={`text-[10px] font-mono ${delta > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                {formatPct(delta, 0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Farmer Advisory */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p>
            <strong>{t("calendar_advisory_label")}</strong>{" "}
            {cropNameNe} {t("calendar_advisory_text").replace("खेती गर्दा", lang === "en" ? "farming:" : "खेती गर्दा")}
          </p>
          <p className="text-[11px] text-slate-400">
            * <strong>{lowestMonthName}</strong> {t("calendar_glut_note")}
          </p>
        </div>
      </div>
    </div>
  );
}