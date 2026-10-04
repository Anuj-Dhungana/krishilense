"use client";

import { useLanguage } from "../../lib/i18n";

export default function MethodologyContent() {
  const { t } = useLanguage();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b pb-4">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
          {t("meth_badge")}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          {t("meth_title")}
        </h1>
        <p className="text-slate-600 text-sm mt-1 leading-relaxed">{t("meth_desc")}</p>
      </div>

      <section className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-amber-950">
              {t("meth_scope_title")}
            </h2>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              {t("meth_scope_desc")}
            </p>
            <div className="text-xs text-amber-800 space-y-1 pt-1 bg-amber-100/60 p-3 rounded-xl border border-amber-200">
              <p>{t("meth_scope_benchmark")}</p>
              <p>{t("meth_scope_curve")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-emerald-800 border-b pb-3">
          <span className="text-xl">🏛</span>
          <h2 className="text-lg font-bold text-slate-900">{t("meth_s1_title")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <SourceCard title={t("meth_ampis_title")} description={t("meth_ampis_desc")} badge={t("meth_ampis_badge")} scope={t("meth_ampis_scope")} href="https://ampis.gov.np" />
          <SourceCard title={t("meth_kalimati_title")} description={t("meth_kalimati_desc")} badge={t("meth_kalimati_badge")} scope={t("meth_kalimati_scope")} href="https://kalimatimarket.gov.np" />
          <SourceCard title={t("meth_opendata_title")} description={t("meth_opendata_desc")} badge={t("meth_opendata_badge")} scope={t("meth_opendata_scope")} href="https://opendatanepal.com/dataset/kalimati-tarkari-dataset" />
          <SourceCard title={t("meth_aitc_title")} description={t("meth_aitc_desc")} badge={t("meth_aitc_badge")} scope={t("meth_aitc_scope")} href="https://aitc.gov.np" />
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <SectionHeading icon="⚖" title={t("meth_s2_title")} />
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t("meth_s2_desc")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <MethodCard title={t("meth_midpoint_title")} description={t("meth_midpoint_desc")} formula={t("meth_midpoint_formula")} note={t("meth_midpoint_markets")} />
          <MethodCard title={t("meth_mean_title")} description={t("meth_mean_desc")} formula={t("meth_mean_formula")} note={t("meth_mean_market")} />
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <SectionHeading icon="📐" title={t("meth_s3_title")} />
        <div className="space-y-4 text-xs sm:text-sm text-slate-700">
          <AnalysisItem title={t("meth_spi_title")} description={t("meth_spi_desc")} formula={t("meth_spi_formula")} note={t("meth_spi_note")} color="border-emerald-600" />
          <AnalysisItem title={t("meth_cv_title")} description={t("meth_cv_desc")} items={[t("meth_cv_daily"), t("meth_cv_annual")]} color="border-amber-500" />
          <AnalysisItem title={t("meth_hcs_title")} description={t("meth_hcs_desc")} items={[t("meth_hcs_high"), t("meth_hcs_moderate"), t("meth_hcs_preliminary")]} color="border-blue-600" />
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <SectionHeading icon="🎯" title={t("meth_s4_title")} />
        <p className="text-xs sm:text-sm text-slate-600">{t("meth_s4_desc")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <CohortCard title={t("meth_cohort_a")} description={t("meth_cohort_a_desc")} color="border-emerald-300 bg-emerald-50/50 text-emerald-900" />
          <CohortCard title={t("meth_cohort_b")} description={t("meth_cohort_b_desc")} color="border-teal-300 bg-teal-50/50 text-teal-900" />
          <CohortCard title={t("meth_cohort_c")} description={t("meth_cohort_c_desc")} color="border-amber-300 bg-amber-50/50 text-amber-900" />
          <CohortCard title={t("meth_cohort_d")} description={t("meth_cohort_d_desc")} color="border-slate-300 bg-slate-100 text-slate-800" />
        </div>
      </section>

      <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 space-y-3">
        <h2 className="font-bold text-amber-950 text-base flex items-center gap-2">{t("meth_s5_title")}</h2>
        <div className="space-y-2 text-xs text-amber-900 leading-relaxed">
          <p><strong>{t("meth_limit_1_title")}:</strong> {t("meth_limit_1_desc")}</p>
          <p><strong>{t("meth_limit_2_title")}:</strong> {t("meth_limit_2_desc")}</p>
          <p><strong>{t("meth_limit_3_title")}:</strong> {t("meth_limit_3_desc")}</p>
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 space-y-1 pt-4 border-t">
        <p>{t("meth_tech_version")} <span className="font-mono text-slate-600">v1.1-phase3.4-A1</span> • {t("meth_param_config")} <span className="font-mono text-slate-600">param-v1.0-defaults</span></p>
        <p>{t("meth_platform_tag")}</p>
      </footer>
    </main>
  );
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 text-emerald-800 border-b pb-3">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    </div>
  );
}

function SourceCard({ title, description, badge, scope, href }: { title: string; description: string; badge: string; scope: string; href: string }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded whitespace-nowrap">{badge}</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-200/60 gap-2">
        <span>{scope}</span>
        <a href={href} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-mono">↗</a>
      </div>
    </div>
  );
}

function MethodCard({ title, description, formula, note }: { title: string; description: string; formula: string; note: string }) {
  return (
    <div className="border border-slate-200 p-4 rounded-xl space-y-1.5 bg-slate-50/50">
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600">{description}</p>
      <div className="font-mono bg-white p-2.5 rounded border text-center text-xs font-bold text-emerald-800 my-2">{formula}</div>
      <p className="text-[11px] text-slate-400">{note}</p>
    </div>
  );
}

function AnalysisItem({ title, description, formula, note, items, color }: { title: string; description: string; formula?: string; note?: string; items?: string[]; color: string }) {
  return (
    <div className={`border-l-4 ${color} pl-4 py-1 space-y-1`}>
      <h3 className="font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      {formula && <p className="font-mono text-xs text-emerald-800 bg-slate-100 p-2 rounded inline-block">{formula}</p>}
      {note && <p className="text-[11px] text-slate-500 italic">{note}</p>}
      {items && <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">{items.map((item) => <li key={item}>{item}</li>)}</ul>}
    </div>
  );
}

function CohortCard({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <div className={`p-3.5 rounded-xl border space-y-1 ${color}`}>
      <span className="font-bold">{title}</span>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
