"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useLanguage } from "../lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaRegistrar() {
  const { lang } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Service Worker Lifecycle
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        // In local development, unregister any active service worker and clear stale caches
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        // In production, register the service worker for PWA functionality
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
              console.log("[PWA] Service Worker registered:", reg.scope);
            })
            .catch((err) => {
              console.warn("[PWA] Service Worker registration failed:", err);
            });
        });
      }
    }

    // 2. Listen for BeforeInstallPrompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("[PWA] KrishiLens installed successfully!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  }

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192x192.png"
          alt="KrishiLens"
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-xl shadow-xs"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-extrabold text-emerald-950 sm:text-sm">
            {lang === "ne" ? "KrishiLens मोबाइल एप" : "KrishiLens Mobile App"}
          </p>
          <p className="truncate text-[11px] text-slate-600">
            {lang === "ne"
              ? "होमस्क्रिनमा इन्स्टल गरी छिटो र अफलाइन हेर्नुहोस्"
              : "Install to home screen for fast & offline access"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-800"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {lang === "ne" ? "इन्स्टल" : "Install"}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
