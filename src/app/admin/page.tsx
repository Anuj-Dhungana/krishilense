"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import { getCropIconUrl } from "../../lib/crop-icons";

interface AdminCommodity {
  id: number;
  code: string;
  nameNe: string;
  nameEn: string;
  categoryNe: string;
  canonicalUnit: string;
  imageUrl: string | null;
}

export default function AdminPage() {
  const [commodities, setCommodities] = useState<AdminCommodity[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h1 className="font-bold text-base tracking-tight">KrishiLens Admin Panel</h1>
              <p className="text-[11px] text-slate-400">बाली तस्विर तथा व्यवस्थापन केन्द्र</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            ← सार्वजनिक साइट (View Site)
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Controls Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">कृषि उपज तस्विर व्यवस्थापन (Device & URL Upload)</h2>
              <p className="text-xs text-slate-500">
                आफ्नो मोबाइल/कम्प्युटरबाट फोटो छान्नुहोस् वा इन्टरनेटको लिंक पेस्ट गर्नुहोस्। सेभ गरेपछि साइटमा तुरुन्तै देखिनेछ।
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 shrink-0">
              कुल सूचीकृत: {commodities.length} बालीहरू
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <input
              type="text"
              placeholder="🔍 बाली खोज्नुहोस् (उदा. गोलभेंडा, आलु, 101.1)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">सबै वर्गहरू (All Categories)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
                  <th className="py-3 px-4 w-16 text-center">प्रिभ्यु</th>
                  <th className="py-3 px-4">कृषि उपज</th>
                  <th className="py-3 px-4">वर्ग</th>
                  <th className="py-3 px-4">तस्विर अपलोड वा लिंक (Device / URL)</th>
                  <th className="py-3 px-4 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      लोड हुँदैछ...
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
                          <span className="px-2.5 py-1 bg-slate-100 rounded-md border text-slate-700">
                            {item.categoryNe}
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
                              <span>डिभाइसबाट छान्नुहोस्</span>
                            </label>

                            {/* Or paste URL */}
                            <input
                              type="text"
                              placeholder="वा लिंक पेस्ट गर्नुहोस् (https://...)"
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
                                title="तस्विर हटाउनुहोस्"
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
                              <span className="text-xs text-emerald-700 font-bold">✓ सेभ भयो</span>
                            )}
                            <button
                              onClick={() => handleSave(item.code)}
                              disabled={savingCode === item.code}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0 shadow-xs"
                            >
                              {savingCode === item.code ? "सेभ हुँदै..." : "सेभ (Save)"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      कुनै बाली भेटिएन।
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