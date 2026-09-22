"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "दैनिक बजार (Daily Market)" },
    { href: "/plan", label: "🌱 के रोप्ने? (What to Grow)" },
    { href: "/compare", label: "📊 बजार तुलना (Comparison)" },
    { href: "/methodology", label: "📖 विधि तथा स्रोत (Methodology)" },
  ];

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🌾</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-800">KrishiLens Nepal</h1>
            <p className="text-[11px] text-slate-500">कृषि बजार मूल्य सूचना तथा निर्णय प्रणाली</p>
          </div>
        </Link>

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
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}