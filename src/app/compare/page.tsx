"use client";

import { useState, useEffect } from "react";

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
  const [commoditiesList, setCommoditiesList] = useState<CommodityItem[]>([]);
  const [commodity, setCommodity] = useState("101.1");
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            बजार-बजार मूल्य तुलना (Regional Market Comparison)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            नेपालका १२ वटै थोक बजारहरूमा आजको संकलित थोक मूल्य र आधार बजारसँगको मूल्य भिन्नता हेर्नुहोस्।
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dynamic Commodity Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>१. कृषि उपज छान्नुहोस् (Select Commodity)</span>
              <span className="text-[11px] font-normal text-emerald-700">
                कुल उपलब्ध: {commoditiesList.length} बालीहरू
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
                        {c.nameNe} ({c.nameEn}) - #{c.code}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Base Benchmark Market */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              २. तुलना गर्ने आधार बजार (Base Benchmark Market)
            </label>
            <select
              value={baseMarket}
              onChange={(e) => setBaseMarket(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <optgroup label="बागमती प्रदेश">
                <option value="kalimati">कालिमाटी (Kathmandu - Base)</option>
                <option value="kamalamai">कमलामाई (Sindhuli)</option>
              </optgroup>
              <optgroup label="कोशी प्रदेश">
                <option value="birtamod">बिर्तामोड (Jhapa)</option>
                <option value="dharan">धरान (Sunsari)</option>
              </optgroup>
              <optgroup label="मधेश प्रदेश">
                <option value="dhalkebar">ढल्केबर (Dhanusha)</option>
                <option value="lalbandi">लालबन्दी (Sarlahi)</option>
              </optgroup>
              <optgroup label="गण्डकी प्रदेश">
                <option value="pokhara">पोखरा (Kaski)</option>
                <option value="kawasoti">कावासोती (Nawalpur)</option>
              </optgroup>
              <optgroup label="लुम्बिनी प्रदेश">
                <option value="butwal">बुटवल (Rupandehi)</option>
                <option value="kohalpur">कोहलपुर (Banke)</option>
              </optgroup>
              <optgroup label="कर्णाली प्रदेश">
                <option value="birendranagar">वीरेन्द्रनगर (Surkhet)</option>
              </optgroup>
              <optgroup label="सुदूरपश्चिम प्रदेश">
                <option value="attariya">अत्तरिया (Kailali)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-100/75 border-b flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm">
              {data?.commodity?.nameNe} ({data?.commodity?.nameEn}) — आजको संकलित थोक मूल्य विवरण
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              इकाइ: {data?.commodity?.canonicalUnit || "kg"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">थोक बजार (Market)</th>
                  <th className="py-3 px-4 text-right">न्यूनतम</th>
                  <th className="py-3 px-4 text-right">अधिकतम</th>
                  <th className="py-3 px-4 text-right text-emerald-800">औसत मूल्य</th>
                  <th className="py-3 px-4 text-right">आधार बजारसँग फरक (Gross Spread)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      मूल्य तथ्याङ्क लोड हुँदैछ...
                    </td>
                  </tr>
                ) : (data?.data && data.data.length > 0) ? (
                  data.data.map((item: MarketPrice, index: number) => (
                    <tr 
                      key={`${item.market_slug}-${index}`} 
                      className={`hover:bg-slate-50 transition-colors ${item.is_base ? "bg-emerald-50/50 font-semibold" : ""}`}
                    >
                      <td className="py-3 px-4">
                        {item.market_name_ne}
                        {item.is_base && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-normal">
                            आधार बजार (Base)
                          </span>
                        )}
                        <span className="block text-xs text-slate-500 font-normal">{item.market_name_en}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        रु. {item.min_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 font-mono">
                        रु. {item.max_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono">
                        रु. {item.representative_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {item.is_base ? (
                          <span className="text-slate-400">—</span>
                        ) : item.gross_spread_rs > 0 ? (
                          <span className="text-emerald-700">+{item.gross_spread_rs.toFixed(2)} (उच्च)</span>
                        ) : item.gross_spread_rs < 0 ? (
                          <span className="text-rose-600">{item.gross_spread_rs.toFixed(2)} (कम)</span>
                        ) : (
                          <span className="text-slate-500">बराबर</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      यस बालीको लागि बजार तथ्याङ्क भेटिएन।
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
              <strong>महत्वपूर्ण सूचना:</strong> {data?.mandatory_disclaimer_ne || "यो तालिकाले बजारहरूमा संकलित थोक मूल्य मात्र देखाउँछ। बजार बीचको मूल्य फरकमा ढुवानी तथा अन्य खर्च जोडिएको छैन।"}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}