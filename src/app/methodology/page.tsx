"use client";

import { useLanguage } from "../../lib/i18n";

export default function MethodologyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Title Header */}
        <div className="border-b pb-4">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {t("meth_badge")}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {t("meth_title")}
          </h1>
          <p className="text-slate-600 text-sm mt-1">{t("meth_desc")}</p>
        </div>

        {/* Section 1: Official Data Sources */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">🏛</span>
            <h2 className="text-lg font-bold text-slate-900">{t("meth_s1_title")}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h3 className="font-bold text-slate-900">{t("meth_ampis_title")}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{t("meth_ampis_desc")}</p>
              <span className="inline-block text-[11px] text-emerald-700 font-mono">ampis.gov.np</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h3 className="font-bold text-slate-900">{t("meth_kalimati_title")}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{t("meth_kalimati_desc")}</p>
              <span className="inline-block text-[11px] text-emerald-700 font-mono">kalimatimarket.gov.np</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h3 className="font-bold text-slate-900">{t("meth_aitc_title")}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{t("meth_aitc_desc")}</p>
              <span className="inline-block text-[11px] text-emerald-700 font-mono">aitc.gov.np</span>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing Methodologies */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">⚖</span>
            <h2 className="text-lg font-bold text-slate-900">{t("meth_s2_title")}</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t("meth_s2_desc")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="border border-slate-200 p-4 rounded-xl space-y-1 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{t("meth_midpoint_title")}</h3>
              <p className="text-xs text-slate-600">{t("meth_midpoint_desc")}</p>
              <div className="font-mono bg-white p-2 rounded border text-center text-xs font-bold text-emerald-800 my-2">
                {t("meth_midpoint_formula")}
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-1 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{t("meth_mean_title")}</h3>
              <p className="text-xs text-slate-600">{t("meth_mean_desc")}</p>
              <div className="font-mono bg-white p-2 rounded border text-center text-xs font-bold text-emerald-800 my-2">
                {t("meth_mean_formula")}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Mathematical Analytics */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">📐</span>
            <h2 className="text-lg font-bold text-slate-900">{t("meth_s3_title")}</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="border-l-4 border-emerald-600 pl-4 py-1 space-y-1">
              <h3 className="font-bold text-slate-900">{t("meth_spi_title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("meth_spi_desc")}</p>
              <p className="font-mono text-xs text-emerald-800 bg-slate-100 p-2 rounded inline-block">
                {t("meth_spi_formula")}
              </p>
              <p className="text-[11px] text-slate-500 italic">{t("meth_spi_note")}</p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4 py-1 space-y-1">
              <h3 className="font-bold text-slate-900">{t("meth_cv_title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("meth_cv_desc")}</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                <li><strong>{t("meth_cv_daily").split(":")[0]}:</strong> {t("meth_cv_daily").split(":").slice(1).join(":")}</li>
                <li><strong>{t("meth_cv_annual").split(":")[0]}:</strong> {t("meth_cv_annual").split(":").slice(1).join(":")}</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-600 pl-4 py-1 space-y-1">
              <h3 className="font-bold text-slate-900">{t("meth_hcs_title")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t("meth_hcs_desc")}</p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                <li><strong>{t("meth_hcs_high").split(":")[0]}:</strong> {t("meth_hcs_high").split(":").slice(1).join(":")}</li>
                <li><strong>{t("meth_hcs_moderate").split(":")[0]}:</strong> {t("meth_hcs_moderate").split(":").slice(1).join(":")}</li>
                <li><strong>{t("meth_hcs_preliminary").split(":")[0]}:</strong> {t("meth_hcs_preliminary").split(":").slice(1).join(":")}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Cohorts */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">🎯</span>
            <h2 className="text-lg font-bold text-slate-900">{t("meth_s4_title")}</h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">{t("meth_s4_desc")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1">
              <span className="font-bold text-emerald-900">{t("meth_cohort_a")}</span>
              <p className="text-slate-600">{t("meth_cohort_a_desc")}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-300 bg-teal-50/50 space-y-1">
              <span className="font-bold text-teal-900">{t("meth_cohort_b")}</span>
              <p className="text-slate-600">{t("meth_cohort_b_desc")}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 space-y-1">
              <span className="font-bold text-amber-900">{t("meth_cohort_c")}</span>
              <p className="text-slate-600">{t("meth_cohort_c_desc")}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-100 space-y-1">
              <span className="font-bold text-slate-800">{t("meth_cohort_d")}</span>
              <p className="text-slate-600">{t("meth_cohort_d_desc")}</p>
            </div>
          </div>
        </section>

        {/* Section 5: Crucial Limitations */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 space-y-3">
          <h2 className="font-bold text-amber-950 text-base flex items-center gap-2">
            {t("meth_s5_title")}
          </h2>

          <div className="space-y-2 text-xs text-amber-900 leading-relaxed">
            <p>
              <strong>{t("meth_limit_1_title")}:</strong> {t("meth_limit_1_desc")}
            </p>
            <p>
              <strong>{t("meth_limit_2_title")}:</strong> {t("meth_limit_2_desc")}
            </p>
            <p>
              <strong>{t("meth_limit_3_title")}:</strong> {t("meth_limit_3_desc")}
            </p>
          </div>
        </section>

        {/* Technical Metadata Footer */}
        <footer className="text-center text-xs text-slate-400 space-y-1 pt-4 border-t">
          <p>
            {t("meth_tech_version")}{" "}
            <span className="font-mono text-slate-600">v1.1-phase3.4-A1</span> •{" "}
            {t("meth_param_config")}{" "}
            <span className="font-mono text-slate-600">param-v1.0-defaults</span>
          </p>
          <p>{t("meth_platform_tag")}</p>
        </footer>
      </main>
    </div>
  );
}