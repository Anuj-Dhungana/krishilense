"use client";

import Link from "next/link";
import { useLanguage, CATEGORY_NE_TO_KEY, type TranslationKey } from "../lib/i18n";
import MarketSelector from "./market-selector";

type PriceRow = {
  id: number;
  commodity_code: string;
  commodity_name_en: string;
  commodity_name_ne: string;
  category_ne: string;
  canonical_unit: string;
  min_price: string;
  max_price: string;
  representative_price: string;
};

type MarketItem = {
  id: number;
  public_slug: string;
  name_ne: string;
  name_en: string;
  district: { name_ne: string; name_en: string };
};

type CategoryPill = { labelNe: string; count: number };

interface Props {
  marketsList: MarketItem[];
  activeMarketSlug: string;
  activeCategory: string; // "all" or Nepali category string
  currentMarket: MarketItem | null;
  dateInfo: { date_ad: string; bs_date: string } | null;
  categoryPills: CategoryPill[];
  filteredPrices: PriceRow[];
}

// Map Nepali category DB string to its English translation
function translateCategoryLabel(labelNe: string, t: (k: TranslationKey) => string): string {
  if (labelNe === "all") return t("cat_all");
  const key = CATEGORY_NE_TO_KEY[labelNe];
  if (key) return t(key);
  return labelNe; // Fallback for unknown categories
}

export default function HomeClient({
  marketsList,
  activeMarketSlug,
  activeCategory,
  currentMarket,
  dateInfo,
  categoryPills,
  filteredPrices,
}: Props) {
  const { t, lang, formatPrice, formatCount, formatDate, formatNum } = useLanguage();

  const marketDisplayName =
    lang === "ne"
      ? currentMarket?.name_ne || "कृषि थोक बजार"
      : currentMarket?.name_en || "Agricultural Wholesale Market";

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block px-2.5 py-0.5 bg-emerald-600/60 rounded text-xs tracking-wider uppercase font-semibold">
            {t("home_badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {t("home_hero_title")}
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base">
            {t("home_hero_desc")}
          </p>
          <div className="pt-2">
            <Link
              href="/plan"
              className="inline-block px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl text-xs sm:text-sm shadow transition-colors"
            >
              {t("home_cta_plan")}
            </Link>
          </div>
        </div>
      </section>

      {/* Market Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span>📍</span> {marketDisplayName}
          </h3>
          <p className="text-xs text-slate-500">
            {t("home_data_date_prefix")}{" "}
            {dateInfo ? `${formatDate(dateInfo.bs_date)} ${t("home_data_date_bs_suffix")} (${formatDate(dateInfo.date_ad)})` : t("home_today")}
            {" "}• {t("home_methodology_label")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MarketSelector markets={marketsList} currentMarket={activeMarketSlug} />
          <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border">
            {t("home_listed_commodities")}{" "}
            <strong className="text-emerald-700">{formatCount(filteredPrices.length)}</strong>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        {categoryPills.map(({ labelNe, count }) => {
          const isActive = activeCategory === labelNe;
          const displayLabel = translateCategoryLabel(labelNe, t);
          return (
            <Link
              key={labelNe}
              href={`/?market=${activeMarketSlug}&category=${encodeURIComponent(labelNe)}`}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                isActive
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{displayLabel}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-emerald-800 text-emerald-100" : "bg-slate-100 text-slate-600"
                }`}
              >
                {formatCount(count)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Price Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100/75 border-b text-slate-700 font-semibold">
                <th className="py-3 px-4">{t("th_commodity")}</th>
                <th className="py-3 px-4">{t("th_category")}</th>
                <th className="py-3 px-4">{t("th_unit")}</th>
                <th className="py-3 px-4 text-right">{t("th_min_price")}</th>
                <th className="py-3 px-4 text-right">{t("th_max_price")}</th>
                <th className="py-3 px-4 text-right text-emerald-800">{t("th_avg_price")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item) => {
                  const commodityName = lang === "ne"
                    ? item.commodity_name_ne
                    : item.commodity_name_en || item.commodity_name_ne;

                  const categoryDisplay =
                    lang === "ne"
                      ? item.category_ne
                      : translateCategoryLabel(item.category_ne, t);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <Link
                          href={`/commodity/${item.commodity_code}?market=${activeMarketSlug}`}
                          className="hover:text-emerald-700 flex flex-col"
                        >
                          <span className="font-semibold text-emerald-950 hover:text-emerald-700">
                            {commodityName}
                          </span>
                          <span className="text-xs font-normal text-slate-500">
                            {categoryDisplay}
                            {!item.commodity_code.startsWith("AMPIS-LIVE-")
                              ? ` (#${formatNum(item.commodity_code)})`
                              : ""}{" "}
                            ➔
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{categoryDisplay}</td>
                      <td className="py-3 px-4 text-slate-600">{item.canonical_unit}</td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        {t("currency")} {formatPrice(item.min_price)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        {t("currency")} {formatPrice(item.max_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                        {t("currency")} {formatPrice(item.representative_price)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    {t("home_empty_category")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
