import Navbar from "@/app/components/layout/Navbar";
import KodigoKlubHero from "@/app/components/kodigoklub/KodigoKlubHero";
import EventShowcase from "@/app/components/kodigoklub/EventShowcase";
import AboutSection from "@/app/components/kodigoklub/AboutSection";
import HorariosSection from "@/app/components/kodigoklub/HorariosSection";
import GallerySection from "@/app/components/kodigoklub/GallerySection";
import ClosingCta from "@/app/components/kodigoklub/ClosingCta";

export default function KodigoKlubPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <KodigoKlubHero />
        <EventShowcase />
        <AboutSection />
        <HorariosSection />
        <GallerySection />
        <ClosingCta />
      </main>
    </>
  );
}
