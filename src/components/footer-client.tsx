"use client";

import { useLanguage } from "../lib/i18n";

export default function FooterClient() {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-white py-6 text-center text-xs text-slate-500 space-y-1">
      <p>{t("footer_source")}</p>
      <p className="text-[11px] text-slate-400">{t("footer_version")}</p>
    </footer>
  );
}
