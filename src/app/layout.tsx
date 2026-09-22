import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";

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
    <html lang="ne">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}>
        {/* Global Navigation Bar on all screens */}
        <Navbar />

        {/* Screen Page Content */}
        <div className="flex-1">{children}</div>

        {/* Global Footer on all screens */}
        <footer className="border-t bg-white py-6 text-center text-xs text-slate-500 space-y-1">
          <p>
            स्रोत: कृषि बजार मूल्य सूचना प्रणाली (AMPIS), कालिमाटी बोर्ड र कृषि सूचना तथा प्रशिक्षण केन्द्र (AITC)
          </p>
          <p className="text-[11px] text-slate-400">
            कार्यविधि संस्करण: v1.1-phase3.4-A1 • KrishiLens Nepal Research
          </p>
        </footer>
      </body>
    </html>
  );
}