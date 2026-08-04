import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import "./globals.css";

const readexPro = Readex_Pro({
  variable: "--font-readex",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ByKanot | Kanot Crew — Competición y Cultura Urbana 2026/2027",
  description:
    "ByKanot es el grupo de competición y cultura urbana liderado por Ariadna y Enrique. Descubre KanotCrew, CódigoClub, nuestro podcast y las formaciones de la temporada 2026/2027.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${readexPro.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-kanot-navy text-white">
        {children}
      </body>
    </html>
  );
}
