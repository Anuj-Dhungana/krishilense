"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useLanguage } from "../lib/i18n";

interface MarketItem {
  public_slug: string;
  name_ne: string;
  name_en: string;
  district: {
    name_ne: string;
    name_en: string;
  };
}

export default function MarketSelector({
  markets,
  currentMarket,
}: {
  markets: MarketItem[];
  currentMarket: string;
}) {
  const router = useRouter();
  const { t, lang } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
        <MapPin className="mr-1 inline-block h-3.5 w-3.5" aria-hidden="true" />
        {t("home_market_label")}
      </span>
      <select
        value={currentMarket}
        onChange={(e) => router.push(`/?market=${e.target.value}`)}
        className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-medium text-slate-800 shadow-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
        aria-label={t("home_market_label")}
      >
        {markets.map((m) => {
          const name = lang === "ne" ? m.name_ne : m.name_en || m.name_ne;
          const district = lang === "ne" ? m.district.name_ne : m.district.name_en || m.district.name_ne;
          return (
            <option key={m.public_slug} value={m.public_slug}>
              {name} ({district})
            </option>
          );
        })}
      </select>
    </div>
  );
}