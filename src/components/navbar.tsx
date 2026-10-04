"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Languages, Sprout, Wheat } from "lucide-react";
import { useLanguage } from "../lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { t, lang, toggleLang } = useLanguage();

  const navLinks = [
    { href: "/", label: t("nav_daily_market") },
    { href: "/plan", label: t("nav_what_to_grow") },
    { href: "/compare", label: t("nav_comparison") },
    { href: "/methodology", label: t("nav_methodology") },
  ];

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <Wheat className="h-7 w-7 text-emerald-700" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-800">{t("brand_name")}</h1>
            <p className="text-[11px] text-slate-500">{t("brand_tagline")}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Navigation Menu */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0 text-xs sm:text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs"
                      : "text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                  }`}
                >
                  {link.href === "/plan" && <Sprout className="mr-1.5 inline-block h-4 w-4" aria-hidden="true" />}
                  {link.href === "/compare" && <BarChart3 className="mr-1.5 inline-block h-4 w-4" aria-hidden="true" />}
                  {link.href === "/methodology" && <BookOpen className="mr-1.5 inline-block h-4 w-4" aria-hidden="true" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Language Toggle Button */}
          <button
            id="lang-toggle-btn"
            onClick={toggleLang}
            title={lang === "ne" ? "Switch to English" : "नेपालीमा हेर्नुहोस्"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span>{t("lang_switch_label")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}