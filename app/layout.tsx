import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { ContactModalProvider } from "@/app/components/contacto/ContactModalContext";
import { CookieConsentProvider } from "@/app/components/legal/CookieConsentContext";
import CookieBanner from "@/app/components/legal/CookieBanner";
import Footer from "@/app/components/layout/Footer";
import BackToTop from "@/app/components/ui/BackToTop";
import "./globals.css";

const readexPro = Readex_Pro({
  variable: "--font-readex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ByKanot | Kanot Krew — Competición y Cultura Urbana 2026/2027",
  description:
    "ByKanot es el grupo de competición y cultura urbana liderado por Ariadna y Eric. Descubre Kanot Krew, CódigoClub, nuestro podcast y las formaciones de la temporada 2026/2027.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${readexPro.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-kanot-navy text-white">
        <ContactModalProvider>
          <CookieConsentProvider>
            {children}
            <Footer />
            <BackToTop />
            <CookieBanner />
          </CookieConsentProvider>
        </ContactModalProvider>
      </body>
    </html>
  );
}
