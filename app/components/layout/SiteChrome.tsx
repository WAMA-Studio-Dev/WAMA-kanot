"use client";

import { usePathname } from "next/navigation";
import Footer from "@/app/components/layout/Footer";
import BackToTop from "@/app/components/ui/BackToTop";
import CookieBanner from "@/app/components/legal/CookieBanner";

/** Pie, "volver arriba" y banner de cookies de la web; la App Kanot (/app) no los muestra. */
export default function SiteChrome() {
  const pathname = usePathname();
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  return (
    <>
      <Footer />
      <BackToTop />
      <CookieBanner />
    </>
  );
}
