"use client";

import { useRouter } from "next/navigation";
import { Sprout, Store } from "lucide-react";
import { useLanguage, CATEGORY_NE_TO_KEY } from "../../lib/i18n";

export interface CommodityOption {
  code: string;
  nameNe: string;
  nameEn: string;
  categoryNe: string;
  categoryEn?: string;
  canonicalUnit: string;
}

export interface MarketOption {
  id: number;
  publicSlug: string;
  nameNe: string;
  nameEn: string;
}

interface ChartSelectorsProps {
  commodities: CommodityOption[];
  markets: MarketOption[];
  selectedCommodityCode: string;
  selectedMarketSlug: string;
}

export default function ChartSelectors({
  commodities,
  markets,
  selectedCommodityCode,
  selectedMarketSlug,
}: ChartSelectorsProps) {
  const router = useRouter();
  const { t, lang, formatCount } = useLanguage();

  // Extract unique category names for grouped optgroups
  const categories = Array.from(new Set(commodities.map((c) => c.categoryNe)));

  function handleCommodityChange(newCode: string) {
    router.push(`/charts?commodity=${encodeURIComponent(newCode)}&market=${encodeURIComponent(selectedMarketSlug)}`);
  }

  function handleMarketChange(newMarket: string) {
    router.push(`/charts?commodity=${encodeURIComponent(selectedCommodityCode)}&market=${encodeURIComponent(newMarket)}`);
  }

  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Crop Selector */}
      <div className="space-y-1.5">
        <label
          htmlFor="commodity-selector"
          className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Sprout className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            {t("charts_select_crop")}
          </span>
          <span className="text-[11px] font-normal text-emerald-700">
            {t("charts_total_available")} {formatCount(commodities.length)}
          </span>
        </label>
        <select
          id="commodity-selector"
          value={selectedCommodityCode}
          onChange={(e) => handleCommodityChange(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none transition-colors"
        >
          {categories.map((cat) => {
            const categoryLabel =
              lang === "ne"
                ? cat
                : CATEGORY_NE_TO_KEY[cat]
                ? t(CATEGORY_NE_TO_KEY[cat]!)
                : cat;

            return (
              <optgroup key={cat} label={`── ${categoryLabel} ──`}>
                {commodities
                  .filter((c) => c.categoryNe === cat)
                  .map((c) => (
                    <option key={c.code} value={c.code}>
                      {lang === "ne" ? c.nameNe : (c.nameEn || c.nameNe)} ({c.code})
                    </option>
                  ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* 2. Wholesale Market Selector */}
      <div className="space-y-1.5">
        <label
          htmlFor="market-selector"
          className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Store className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            {t("charts_select_market")}
          </span>
          <span className="text-[11px] font-normal text-emerald-700">
            {t("charts_total_available")} {formatCount(markets.length)}
          </span>
        </label>
        <select
          id="market-selector"
          value={selectedMarketSlug}
          onChange={(e) => handleMarketChange(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none transition-colors"
        >
          {markets.map((m) => (
            <option key={m.publicSlug} value={m.publicSlug}>
              {lang === "ne" ? m.nameNe : (m.nameEn || m.nameNe)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
