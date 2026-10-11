"use client";

import { useState, useEffect, ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { getCropIconUrl } from "../../lib/crop-icons";
import { CATEGORY_NE_TO_KEY, useLanguage } from "../../lib/i18n";

interface AdminCommodity {
  id: number;
  code: string;
  nameNe: string;
  nameEn: string;
  categoryNe: string;
  canonicalUnit: string;
  imageUrl: string | null;
}

interface AdminMarket {
  id: number;
  slug: string;
  nameNe: string;
  nameEn: string;
}

interface AdminPrice {
  marketId: number;
  commodityCode: string;
  minPrice: string;
  maxPrice: string;
  representativePrice: string;
  sourceSystem: string;
  sourceLabel: string | null;
}

export default function AdminPage() {
  const { lang, toggleLang, t } = useLanguage();
  const router = useRouter();
  const [commodities, setCommodities] = useState<AdminCommodity[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState<AdminMarket[]>([]);
  const [adminPrices, setAdminPrices] = useState<AdminPrice[]>([]);
  const [priceForm, setPriceForm] = useState({
    marketSlug: "",
    commodityCode: "",
    minPrice: "",
    maxPrice: "",
    representativePrice: "",
    sourceLabel: "",
  });
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/commodities");
        const json = await res.json();
        if (json.success && json.data) {
          setCommodities(json.data);
          const urls: Record<string, string> = {};
          json.data.forEach((c: AdminCommodity) => {
            urls[c.code] = c.imageUrl || "";
          });
          setEditingUrls(urls);
        }
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/admin/prices");
        const json = await res.json();
        if (json.success && json.data) {
          setMarkets(json.data.markets);
          setAdminPrices(json.data.prices);
          setPriceForm((current) => ({
            ...current,
            marketSlug: current.marketSlug || json.data.markets[0]?.slug || "",
            commodityCode: current.commodityCode || json.data.commodities[0]?.code || "",
          }));
        }
      } catch (error: unknown) {
        console.error("Failed to load admin prices:", error);
      }
    }
    fetchPrices();
  }, []);

  function updatePriceSelection(field: "marketSlug" | "commodityCode", value: string) {
    const nextForm = { ...priceForm, [field]: value };
    const nextMarket = markets.find((market) => market.slug === nextForm.marketSlug);
    const nextPrice = adminPrices.find(
      (price) => price.marketId === nextMarket?.id && price.commodityCode === nextForm.commodityCode
    );
    setPriceForm({
      ...nextForm,
      minPrice: nextPrice?.minPrice || "",
      maxPrice: nextPrice?.maxPrice || "",
      representativePrice: nextPrice?.representativePrice || "",
      sourceLabel: nextPrice?.sourceLabel || "",
    });
  }

  async function handlePriceSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPriceSaving(true);
    setPriceMessage("");
    try {
      const response = await fetch("/api/admin/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(priceForm),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setPriceMessage(result.error || "Price could not be saved.");
        return;
      }
      setPriceMessage("मूल्य पोस्ट भयो (Price saved)");
      const refreshed = await fetch("/api/admin/prices");
      const refreshedJson = await refreshed.json();
      if (refreshedJson.success) setAdminPrices(refreshedJson.data.prices);
    } catch (error: unknown) {
      console.error("Failed to save admin price:", error);
      setPriceMessage("मूल्य सेभ गर्न सकिएन (Could not save price).");
    } finally {
      setPriceSaving(false);
    }
  }

  // Handle direct file upload to Cloudinary CDN
  async function handleDeviceFileUpload(code: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("❌ Cloudinary details missing in .env.local! Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.");
      return;
    }

    setSavingCode(code);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Upload directly from browser to Cloudinary CDN
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        // Automatically inject Cloudinary's auto-format and auto-compression tags
        const optimizedUrl = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_300,c_limit/");
        setEditingUrls((prev) => ({ ...prev, [code]: optimizedUrl }));
      } else {
        alert("Upload failed. Verify your Cloudinary preset is set to 'Unsigned'.");
      }
    } catch (err: unknown) {
      console.error("Cloudinary upload failed:", err);
      alert("Error uploading image to Cloudinary.");
    } finally {
      setSavingCode(null);
    }
  }

  // Save changes to Neon PostgreSQL
  async function handleSave(code: string) {
    setSavingCode(code);
    const newUrl = editingUrls[code] || "";

    try {
      const res = await fetch("/api/admin/commodities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, imageUrl: newUrl }),
      });
      const json = await res.json();
      if (json.success) {
        setCommodities((prev) =>
          prev.map((c) => (c.code === code ? { ...c, imageUrl: newUrl || null } : c))
        );
        setSaveSuccess(code);
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err: unknown) {
      console.error("Save error:", err);
    } finally {
      setSavingCode(null);
    }
  }

  // Clear image and revert to vector icon
  function handleClear(code: string) {
    setEditingUrls((prev) => ({ ...prev, [code]: "" }));
  }

  const filtered = commodities.filter((c) => {
    const matchesSearch =
      c.nameNe.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search);
    const matchesCat = categoryFilter === "all" || c.categoryNe === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(commodities.map((c) => c.categoryNe)));
  const translateCategory = (categoryNe: string) => {
    const key = CATEGORY_NE_TO_KEY[categoryNe];
    return key ? t(key) : categoryNe;
  };

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h1 className="font-bold text-base tracking-tight">{t("admin_title")}</h1>
              <p className="text-[11px] text-slate-400">{t("admin_subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              title={lang === "ne" ? "Switch to English" : "नेपालीमा हेर्नुहोस्"}
              aria-label="Toggle language"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              <span>{t("lang_switch_label")}</span>
            </button>
            <Link
              href="/"
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
            >
              {t("admin_view_site")}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-rose-800 bg-rose-900 px-3 py-1.5 text-xs font-bold text-rose-100 transition-colors hover:bg-rose-800"
            >
              लगआउट (Logout)
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">दैनिक मूल्य व्यवस्थापन (Daily Price Overrides / Benchmarks)</h2>
            <p className="text-xs text-slate-500">
              AMPIS मा नआएको वस्तुका लागि आधिकारिक सन्दर्भ मूल्य पोस्ट गर्नुहोस्।
              (Post a verified fallback price when AMPIS has no value.)
            </p>
          </div>
          <form onSubmit={handlePriceSave} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <select
              required
              value={priceForm.marketSlug}
              onChange={(event) => updatePriceSelection("marketSlug", event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">बजार छान्नुहोस् (Select market)</option>
              {markets.map((market) => (
                <option key={market.slug} value={market.slug}>{market.nameNe} / {market.nameEn}</option>
              ))}
            </select>
            <select
              required
              value={priceForm.commodityCode}
              onChange={(event) => updatePriceSelection("commodityCode", event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">वस्तु छान्नुहोस् (Select commodity)</option>
              {commodities.map((commodity) => (
                <option key={commodity.code} value={commodity.code}>
                  {commodity.categoryNe} — {commodity.nameNe} / {commodity.nameEn}
                </option>
              ))}
            </select>
            <input required type="number" min="0" step="0.01" placeholder="न्यूनतम (Minimum)"
              value={priceForm.minPrice} onChange={(event) => setPriceForm({ ...priceForm, minPrice: event.target.value })}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input required type="number" min="0" step="0.01" placeholder="अधिकतम (Maximum)"
              value={priceForm.maxPrice} onChange={(event) => setPriceForm({ ...priceForm, maxPrice: event.target.value })}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input required type="number" min="0" step="0.01" placeholder="प्रतिनिधि मूल्य (Representative)"
              value={priceForm.representativePrice} onChange={(event) => setPriceForm({ ...priceForm, representativePrice: event.target.value })}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input type="text" placeholder="स्रोत (Source label, e.g. DDC / MSP)"
              value={priceForm.sourceLabel} onChange={(event) => setPriceForm({ ...priceForm, sourceLabel: event.target.value })}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <div className="flex items-center gap-3 lg:col-span-3">
              <button type="submit" disabled={priceSaving}
                className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50">
                {priceSaving ? "सेभ हुँदैछ..." : "मूल्य पोस्ट गर्नुहोस् (Save Price)"}
              </button>
              {priceMessage && <span className="text-sm text-slate-600">{priceMessage}</span>}
            </div>
          </form>
        </section>

        {/* Controls Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t("admin_image_management")}</h2>
              <p className="text-xs text-slate-500">
                {t("admin_image_description")}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shrink-0">
              {t("admin_total_listed")}: {commodities.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <input
              type="text"
              placeholder={t("admin_search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">{t("admin_all_categories")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {translateCategory(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Commodities Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/75 border-b text-slate-700 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">{t("admin_preview")}</th>
                  <th className="py-3 px-4">{t("admin_commodity")}</th>
                  <th className="py-3 px-4">{t("admin_category")}</th>
                  <th className="py-3 px-4">{t("admin_upload_link")}</th>
                  <th className="py-3 px-4 text-right">{t("admin_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      {t("admin_loading")}
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((item) => {
                    const currentUrl = editingUrls[item.code] || "";
                    const previewSrc = currentUrl || getCropIconUrl(item.nameNe, item.categoryNe, item.code);
                    const isCustom = !!currentUrl;

                    return (
                      <tr key={item.code} className="hover:bg-slate-50/75 transition-colors">
                        {/* Live Thumbnail Preview */}
                        <td className="py-3 px-4 text-center">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewSrc}
                              alt={item.nameNe}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getCropIconUrl(item.nameNe, item.categoryNe, item.code);
                              }}
                            />
                          </div>
                        </td>

                        {/* Name and Code */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.nameNe}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            {item.nameEn} (#{item.code})
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-xs text-slate-600">
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 bg-slate-100 rounded-md border text-slate-700">
                            {translateCategory(item.categoryNe)}
                          </span>
                        </td>

                        {/* Upload Controls: Device File Picker + Text URL */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            {/* Hidden file input */}
                            <input
                              type="file"
                              accept="image/*"
                              id={`upload-${item.code}`}
                              className="hidden"
                              onChange={(e) => handleDeviceFileUpload(item.code, e)}
                            />

                            {/* Stylized File Upload Button */}
                            <label
                              htmlFor={`upload-${item.code}`}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer border border-slate-300 transition-colors flex items-center justify-center gap-1 shrink-0"
                            >
                              <span>📁</span>
                              <span>{t("admin_choose_device")}</span>
                            </label>

                            {/* Or paste URL */}
                            <input
                              type="text"
                              placeholder={t("admin_paste_link")}
                              value={currentUrl.startsWith("data:") ? "[ डिभाइसको फोटो छानियो ]" : currentUrl}
                              onChange={(e) =>
                                setEditingUrls({ ...editingUrls, [item.code]: e.target.value })
                              }
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                            />

                            {/* Clear Button if custom image is set */}
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => handleClear(item.code)}
                                title={t("admin_remove_image")}
                                className="px-2 py-1 text-slate-400 hover:text-rose-600 text-xs font-bold transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Save Action */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {saveSuccess === item.code && (
                              <span className="text-xs text-emerald-700 font-bold">{t("admin_saved")}</span>
                            )}
                            <button
                              onClick={() => handleSave(item.code)}
                              disabled={savingCode === item.code}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 shadow-xs"
                            >
                              {savingCode === item.code ? t("admin_saving") : t("admin_save")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {t("admin_no_commodities")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}