"use client";

import { LineChart } from "lucide-react";
import { useLanguage } from "../../lib/i18n";

export default function ChartsHeader() {
  const { t, lang } = useLanguage();

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
          {lang === "ne" ? "एनालिटिक्स हब (Analytics Hub)" : "Analytics Hub"}
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
        {t("charts_page_title")}
      </h1>
      <p className="text-slate-500 text-sm mt-1">
        {t("charts_page_subtitle")}
      </p>
    </div>
  );
}
