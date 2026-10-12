"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  Languages,
  Menu,
  Sprout,
  Store,
  TrendingUp,
  Wheat,
  X,
} from "lucide-react";
import { useLanguage } from "../lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { t, lang, toggleLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { href: "/", label: t("nav_daily_market"), icon: Store },
    { href: "/plan", label: t("nav_what_to_grow"), icon: Sprout },
    { href: "/charts", label: t("nav_charts"), icon: TrendingUp },
    { href: "/compare", label: t("nav_comparison"), icon: BarChart3 },
    { href: "/methodology", label: t("nav_methodology"), icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-xs ring-1 ring-emerald-200/60">
            <Wheat className="h-6 w-6 text-emerald-700" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-emerald-950">
              {t("brand_name")}
            </span>
            <p className="hidden xl:block text-[10px] font-medium text-slate-500">
              {t("brand_tagline")}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Menu (hidden on mobile/tablet, visible on lg+) */}
        <div className="hidden items-center gap-2 xl:gap-3 lg:flex">
          <nav className="flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-medium">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 xl:px-3.5 py-2 transition-colors ${
                    isActive
                      ? "border border-emerald-200 bg-emerald-50 font-bold text-emerald-900 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-emerald-700"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={toggleLang}
            title={lang === "ne" ? "Switch to English" : "नेपालीमा हेर्नुहोस्"}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            aria-label="Toggle language"
          >
            <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t("lang_switch_label")}</span>
          </button>
        </div>

        {/* Mobile Action Controls (Lang Toggle + Hamburger Menu) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleLang}
            title={lang === "ne" ? "Switch to English" : "नेपालीमा हेर्नुहोस्"}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            aria-label="Toggle language"
          >
            <Languages className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            <span>{lang === "ne" ? "EN" : "नेपाली"}</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown & Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-x-0 top-[65px] bottom-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="border-b border-emerald-100 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border border-emerald-200 bg-emerald-50 font-bold text-emerald-900"
                        : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isActive ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span>{link.label}</span>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-1 pt-4 text-xs text-slate-500">
              <span>{t("brand_name")}</span>
              <button
                onClick={() => {
                  toggleLang();
                  setIsOpen(false);
                }}
                className="font-bold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
              >
                {lang === "ne" ? "Switch to English" : "नेपालीमा हेर्नुहोस्"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}