"use client";

import { useRouter } from "next/navigation";

interface MarketItem {
  public_slug: string;
  name_ne: string;
  district: {
    name_ne: string;
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

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
        बजार छनोट:
      </span>
      <select
        value={currentMarket}
        onChange={(e) => router.push(`/?market=${e.target.value}`)}
        className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white font-medium text-slate-800 shadow-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
      >
        {markets.map((m) => (
          <option key={m.public_slug} value={m.public_slug}>
            📍 {m.name_ne} ({m.district.name_ne})
          </option>
        ))}
      </select>
    </div>
  );
}