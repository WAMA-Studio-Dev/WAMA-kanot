import Navbar from "@/app/components/layout/Navbar";
import KodigoKlubHero from "@/app/components/kodigoklub/KodigoKlubHero";
import JoinBand from "@/app/components/kodigoklub/JoinBand";
import PhotoCarousel from "@/app/components/kodigoklub/PhotoCarousel";
import PosterGallery from "@/app/components/kodigoklub/PosterGallery";
import UneteKodigo from "@/app/components/kodigoklub/UneteKodigo";
import ComoLlegar from "@/app/components/kodigoklub/ComoLlegar";

export default function KodigoKlubPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <KodigoKlubHero />
        <JoinBand />
        <PhotoCarousel />
        <PosterGallery />
        <UneteKodigo />
        <ComoLlegar />
      </main>
    </>
  );
}
