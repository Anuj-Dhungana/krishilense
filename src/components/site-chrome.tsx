"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";
import FooterClient from "./footer-client";

export default function SiteChrome() {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <Navbar />
      <FooterClient />
    </>
  );
}
