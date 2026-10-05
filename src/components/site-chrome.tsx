"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import FooterClient from "./footer-client";

export default function SiteChrome() {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isHomeRoute = pathname === "/";

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <Navbar />
      {!isHomeRoute && <FooterClient />}
    </>
  );
}
