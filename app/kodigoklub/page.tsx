import KodigoKlubFloatingNav from "@/app/components/kodigoklub/KodigoKlubFloatingNav";
import KodigoKlubHero from "@/app/components/kodigoklub/KodigoKlubHero";
import JoinBand from "@/app/components/kodigoklub/JoinBand";
import EdicionesKodigo from "@/app/components/kodigoklub/EdicionesKodigo";

export default function KodigoKlubPage() {
  return (
    <>
      <KodigoKlubFloatingNav />
      <main className="flex-1">
        <KodigoKlubHero />
        <JoinBand />
        <EdicionesKodigo />
      </main>
    </>
  );
}
