"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../../lib/i18n";

interface CommodityItem {
  code: string;
  nameNe: string;
  nameEn: string;
  categoryNe: string;
  canonicalUnit: string;
}

interface MarketPrice {
  market_slug: string;
  market_name_ne: string;
  market_name_en: string;
  min_price: number;
  max_price: number;
  representative_price: number;
  gross_spread_rs: number;
  is_base: boolean;
}

interface CompareResponse {
  success: boolean;
  commodity?: {
    code: string;
    nameNe: string;
    nameEn: string;
    canonicalUnit: string;
  };
  base_market_slug?: string;
  base_price?: number | null;
  total_markets?: number;
  data: MarketPrice[];
  mandatory_disclaimer_ne?: string;
}

export default function ComparePage() {
  const { t, lang, formatPrice } = useLanguage();
  const searchParams = useSearchParams();
  const [commoditiesList, setCommoditiesList] = useState<CommodityItem[]>([]);
  const [commodity, setCommodity] = useState(() => searchParams.get("commodity") || "101.1");
  const [baseMarket, setBaseMarket] = useState("kalimati");
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch ALL registered commodities dynamically from Neon
  useEffect(() => {
    async function loadCommodities() {
      try {
        const res = await fetch("/api/commodities");
        const json = await res.json();
        if (json.success && json.data) {
          setCommoditiesList(json.data);
        }
      } catch (err: unknown) {
        console.error("Failed to load commodities list:", err);
      }
    }
    loadCommodities();
  }, []);

  // 2. Fetch prices comparison whenever selected commodity or base market changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/prices/compare?commodity=${commodity}&base=${baseMarket}`);
        const json: CompareResponse = await res.json();
        setData(json);
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [commodity, baseMarket]);

  // Extract unique category names for grouped optgroups
  const categories = Array.from(new Set(commoditiesList.map((c) => c.categoryNe)));

  const commodityTitle =
    lang === "ne"
      ? data?.commodity?.nameNe
      : data?.commodity?.nameEn || data?.commodity?.nameNe;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t("compare_title")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t("compare_desc")}</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dynamic Commodity Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>{t("compare_select_commodity")}</span>
              <span className="text-[11px] font-normal text-emerald-700">
                {t("compare_total_available")} {commoditiesList.length} {t("compare_crops_count")}
              </span>
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {commoditiesList
                    .filter((c) => c.categoryNe === cat)
                    .map((c) => (
                      <option key={c.code} value={c.code}>
                        {lang === "ne" ? c.nameNe : (c.nameEn || c.nameNe)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Base Benchmark Market */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t("compare_base_market")}
            </label>
            <select
              value={baseMarket}
              onChange={(e) => setBaseMarket(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <optgroup label={lang === "ne" ? "बागमती प्रदेश" : "Bagmati Province"}>
                <option value="kalimati">{lang === "ne" ? "कालिमाटी (काठमाडौँ - आधार)" : "Kalimati (Kathmandu - Base)"}</option>
                <option value="kamalamai">{lang === "ne" ? "कमलामाई (सिन्धुली)" : "Kamalamai (Sindhuli)"}</option>
              </optgroup>
              <optgroup label={lang === "ne" ? "कोशी प्रदेश" : "Koshi Province"}>
                <option value="birtamod">{lang === "ne" ? "बिर्तामोड (झापा)" : "Birtamod (Jhapa)"}</option>
                <option value="dharan">{lang === "ne" ? "धरान (सुनसरी)" : "Dharan (Sunsari)"}</option>
              </optgroup>
              <optgroup label={lang === "ne" ? "मधेश प्रदेश" : "Madhesh Province"}>
                <option value="dhalkebar">{lang === "ne" ? "ढल्केबर (धनुषा)" : "Dhalkebar (Dhanusha)"}</option>
                <option value="lalbandi">{lang === "ne" ? "लालबन्दी (सर्लाही)" : "Lalbandi (Sarlahi)"}</option>
              </optgroup>
              <optgroup label={lang === "ne" ? "गण्डकी प्रदेश" : "Gandaki Province"}>
                <option value="pokhara">{lang === "ne" ? "पोखरा (कास्की)" : "Pokhara (Kaski)"}</option>
                <option value="kawasoti">{lang === "ne" ? "कावासोती (नवलपुर)" : "Kawasoti (Nawalpur)"}</option>
              </optgroup>
              <optgroup label={lang === "ne" ? "लुम्बिनी प्रदेश" : "Lumbini Province"}>
                <option value="butwal">{lang === "ne" ? "बुटवल (रुपन्देही)" : "Butwal (Rupandehi)"}</option>
                <option value="kohalpur">{lang === "ne" ? "कोहलपुर (बाँके)" : "Kohalpur (Banke)"}</option>
              </optgroup>
              <optgroup label={lang === "ne" ? "कर्णाली प्रदेश" : "Karnali Province"}>
                <option value="birendranagar">{lang === "ne" ? "वीरेन्द्रनगर (सुर्खेत)" : "Birendranagar (Surkhet)"}</option>
              </optgroup>
              <optgroup label={lang === "ne" ? "सुदूरपश्चिम प्रदेश" : "Sudurpashchim Province"}>
                <option value="attariya">{lang === "ne" ? "अत्तरिया (कैलाली)" : "Attariya (Kailali)"}</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-100/75 border-b flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm">
              {commodityTitle} — {t("compare_table_title_suffix")}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {t("compare_unit_label")} {data?.commodity?.canonicalUnit || "kg"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">{t("th_market")}</th>
                  <th className="py-3 px-4 text-right">{t("th_min_price")}</th>
                  <th className="py-3 px-4 text-right">{t("th_max_price")}</th>
                  <th className="py-3 px-4 text-right text-emerald-800">{t("th_avg_price")}</th>
                  <th className="py-3 px-4 text-right">{t("th_gross_spread")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      {t("compare_loading")}
                    </td>
                  </tr>
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((item: MarketPrice, index: number) => {
                    const marketName =
                      lang === "ne"
                        ? item.market_name_ne
                        : item.market_name_en || item.market_name_ne;

                    return (
                      <tr
                        key={`${item.market_slug}-${index}`}
                        className={`hover:bg-slate-50 transition-colors ${item.is_base ? "bg-emerald-50/50 font-semibold" : ""}`}
                      >
                        <td className="py-3 px-4">
                          {marketName}
                          {item.is_base && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-normal">
                              {t("compare_base_badge")}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono">
                          {t("currency")} {formatPrice(item.min_price)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono">
                          {t("currency")} {formatPrice(item.max_price)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                          {t("currency")} {formatPrice(item.representative_price)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {item.is_base ? (
                            <span className="text-slate-400">—</span>
                          ) : item.gross_spread_rs > 0 ? (
                            <span className="text-emerald-700">
                              +{formatPrice(item.gross_spread_rs)} ({t("compare_higher")})
                            </span>
                          ) : item.gross_spread_rs < 0 ? (
                            <span className="text-rose-600">
                              {formatPrice(item.gross_spread_rs)} ({t("compare_lower")})
                            </span>
                          ) : (
                            <span className="text-slate-500">{t("compare_equal")}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      {t("compare_no_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mandatory Disclaimer Footer */}
          <div className="p-4 bg-amber-50/70 border-t border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
            <span className="text-base">⚠</span>
            <span>
              <strong>{t("compare_disclaimer_label")}</strong>{" "}
              {t("compare_disclaimer_text")}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}