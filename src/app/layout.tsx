import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../lib/i18n";
import SiteChrome from "../components/site-chrome";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KrishiLens Nepal — कृषि बजार मूल्य तथा निर्णय प्रणाली",
  description: "Nepal Agriculture Market Intelligence & Farmer Decision Support Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}>
        <LanguageProvider>
          <SiteChrome />

          {/* Screen Page Content */}
          <div className="flex-1">{children}</div>
        </LanguageProvider>
      </body>
    </html>
  );
}