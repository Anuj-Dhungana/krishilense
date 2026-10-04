import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
import { LanguageProvider } from "../lib/i18n";
import FooterClient from "../components/footer-client";

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
          {/* Global Navigation Bar on all screens */}
          <Navbar />

          {/* Screen Page Content */}
          <div className="flex-1">{children}</div>

          {/* Global Footer on all screens */}
          <FooterClient />
        </LanguageProvider>
      </body>
    </html>
  );
}