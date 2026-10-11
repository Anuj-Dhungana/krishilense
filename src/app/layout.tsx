import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../lib/i18n";
import { SiteFooter } from "../components/site-chrome";
import SiteChrome from "../components/site-chrome";
import PwaRegistrar from "../components/pwa-registrar";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#064E3B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "KrishiLens Nepal — कृषि बजार मूल्य तथा निर्णय प्रणाली",
  description: "Nepal Agriculture Market Intelligence & Farmer Decision Support Platform",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KrishiLens",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`} suppressHydrationWarning>
        <LanguageProvider>
          <SiteChrome />

          {/* Screen Page Content */}
          <div className="flex-1">{children}</div>

          <SiteFooter />
          <PwaRegistrar />
        </LanguageProvider>
      </body>
    </html>
  );
}