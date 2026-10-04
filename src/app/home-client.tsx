"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Filter, Leaf, MapPin, Search, Store, Tag, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useLanguage, CATEGORY_NE_TO_KEY, type TranslationKey } from "../lib/i18n";

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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("all");
  const [date, setDate] = useState(dateInfo?.date_ad || "");

  const marketDisplayName =
    lang === "ne"
      ? currentMarket?.name_ne || "कृषि थोक बजार"
      : currentMarket?.name_en || "Agricultural Wholesale Market";

  const units = Array.from(new Set(filteredPrices.map((item) => item.canonical_unit))).filter(Boolean);
  const averagePrice = filteredPrices.length
    ? filteredPrices.reduce((sum, item) => sum + Number(item.representative_price), 0) / filteredPrices.length
    : 0;
  const latestUpdate = dateInfo?.date_ad ? formatDate(dateInfo.date_ad) : t("home_today");
  const visiblePrices = filteredPrices.filter((item) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [item.commodity_name_en, item.commodity_name_ne, item.commodity_code]
      .some((value) => value.toLowerCase().includes(query));
    const matchesUnit = unit === "all" || item.canonical_unit === unit;
    return matchesSearch && matchesUnit;
  });

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("market", activeMarketSlug);
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (date) params.set("date", date);
    router.push(`/?${params.toString()}`);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <section className="relative min-h-[150px] overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 px-6 py-5 shadow-sm sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 bg-contain bg-right bg-no-repeat"
          style={{ backgroundImage: "url('/banner.jpg')" }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Fresh Produce · Fair Prices · Stronger Farmers
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-950 sm:text-3xl">
            {marketDisplayName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />{currentMarket?.district.name_en || "Nepal"}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />{latestUpdate}</span>
            <span className="text-slate-400">{lang === "ne" ? "(आजको बजार)" : "(Updated today)"}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={<Leaf className="h-5 w-5" />} label={lang === "ne" ? "कुल कृषि उपज" : "Total Commodities"} value={formatCount(filteredPrices.length)} detail={lang === "ne" ? "आज सूचीकृत" : "items listed today"} />
        <SummaryCard icon={<Tag className="h-5 w-5" />} label={lang === "ne" ? "औसत मूल्य" : "Average Price"} value={`${t("currency")} ${formatPrice(averagePrice)}`} detail={lang === "ne" ? "आजको बजार औसत" : "today's market average"} />
        <SummaryCard icon={<Store className="h-5 w-5" />} label={lang === "ne" ? "कुल बजार" : "Total Markets"} value={formatCount(marketsList.length)} detail={lang === "ne" ? "सम्बन्धित बजार" : "connected markets"} />
        <SummaryCard icon={<CalendarDays className="h-5 w-5" />} label={lang === "ne" ? "पछिल्लो अपडेट" : "Latest Update"} value={latestUpdate} detail={dateInfo?.bs_date ? formatDate(dateInfo.bs_date) : ""} />
      </section>

      <form onSubmit={applyFilters} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.9fr_auto] gap-3 items-end">
        <label className="relative block">
          <span className="sr-only">{lang === "ne" ? "कृषि उपज खोज्नुहोस्" : "Search commodity"}</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={lang === "ne" ? "कृषि उपज खोज्नुहोस्..." : "Search commodity..."}
            className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="text-[10px] font-semibold text-slate-500">
          {lang === "ne" ? "वर्ग" : "Commodity / Category"}
          <select value={activeCategory} onChange={(event) => router.push(`/?market=${activeMarketSlug}&category=${encodeURIComponent(event.target.value)}`)} className="mt-1 w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700">
            {categoryPills.map(({ labelNe }) => <option key={labelNe} value={labelNe}>{translateCategoryLabel(labelNe, t)}</option>)}
          </select>
        </label>

        <label className="text-[10px] font-semibold text-slate-500">
          {lang === "ne" ? "बजार" : "Market"}
          <select value={activeMarketSlug} onChange={(event) => router.push(`/?market=${event.target.value}&category=${encodeURIComponent(activeCategory)}`)} className="mt-1 w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700">
            {marketsList.map((marketItem) => <option key={marketItem.public_slug} value={marketItem.public_slug}>{lang === "ne" ? marketItem.name_ne : marketItem.name_en}</option>)}
          </select>
        </label>

        <label className="text-[10px] font-semibold text-slate-500">
          {lang === "ne" ? "इकाइ" : "Unit"}
          <select value={unit} onChange={(event) => setUnit(event.target.value)} className="mt-1 w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700">
            <option value="all">{lang === "ne" ? "सबै इकाइ" : "All Units"}</option>
            {units.map((itemUnit) => <option key={itemUnit} value={itemUnit}>{itemUnit}</option>)}
          </select>
        </label>

        <label className="text-[10px] font-semibold text-slate-500">
          {lang === "ne" ? "मिति" : "Date"}
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700" />
        </label>

        <button type="submit" className="h-10 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 inline-flex items-center justify-center gap-2">
          <Filter className="h-3.5 w-3.5" aria-hidden="true" />
          {lang === "ne" ? "फिल्टर लागू गर्नुहोस्" : "Apply Filters"}
        </button>
      </form>

      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-lg font-bold text-emerald-950">
          <TrendingUp className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          {lang === "ne" ? "आजको बजार मूल्य" : "Market Price List"}
        </h2>
        <span className="text-xs text-slate-500">{formatCount(visiblePrices.length)} {lang === "ne" ? "उपज" : "items"}</span>
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
              {visiblePrices.length > 0 ? (
                visiblePrices.map((item) => {
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
                            {categoryDisplay} ➔
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

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="flex min-h-[112px] items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-slate-500">{label}</p>
        <p className="mt-1 truncate text-xl font-extrabold text-emerald-950">{value}</p>
        <p className="mt-1 truncate text-[10px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
