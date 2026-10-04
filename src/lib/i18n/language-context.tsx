"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type Language, translations, type TranslationKey } from "./translations";
import {
  toNepaliNumerals,
  formatPrice as formatPriceUtil,
  formatCount as formatCountUtil,
  formatPct as formatPctUtil,
  formatDate as formatDateUtil,
} from "./numerals";

const STORAGE_KEY = "krishilens-lang";
const DEFAULT_LANG: Language = "en";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
  formatPrice: (value: number | string | null | undefined, digits?: number) => string;
  formatCount: (value: number | string | null | undefined) => string;
  formatPct: (value: number | string | null | undefined, digits?: number) => string;
  formatDate: (dateStr: string | null | undefined) => string;
  formatNum: (value: string | number | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG);
  const [mounted, setMounted] = useState(false);

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "ne" || saved === "en") {
      setLangState(saved);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    // Update html lang attribute for accessibility
    document.documentElement.lang = newLang;
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "ne" ? "en" : "ne");
  }, [lang, setLang]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[lang] || entry.en || key;
    },
    [lang]
  );

  const activeLang = mounted ? lang : DEFAULT_LANG;

  const formatPrice = useCallback(
    (value: number | string | null | undefined, digits = 2) =>
      formatPriceUtil(value, activeLang, digits),
    [activeLang]
  );

  const formatCount = useCallback(
    (value: number | string | null | undefined) =>
      formatCountUtil(value, activeLang),
    [activeLang]
  );

  const formatPct = useCallback(
    (value: number | string | null | undefined, digits = 2) =>
      formatPctUtil(value, activeLang, digits),
    [activeLang]
  );

  const formatDate = useCallback(
    (dateStr: string | null | undefined) =>
      formatDateUtil(dateStr, activeLang),
    [activeLang]
  );

  const formatNum = useCallback(
    (value: string | number | null | undefined) =>
      activeLang === "ne" ? toNepaliNumerals(value) : String(value ?? ""),
    [activeLang]
  );

  const contextValue: LanguageContextValue = {
    lang: activeLang,
    setLang,
    t,
    toggleLang,
    formatPrice,
    formatCount,
    formatPct,
    formatDate,
    formatNum,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
