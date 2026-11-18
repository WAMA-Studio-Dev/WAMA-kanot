import { notFound } from "next/navigation";
import Navbar from "@/app/components/layout/Navbar";
import EquiposGrid from "@/app/components/temporadas/EquiposGrid";
import GaleriaCollage from "@/app/components/temporadas/GaleriaCollage";
import { PATTERN_12 } from "@/app/components/temporadas/collagePatterns";
import { galeria20252026, galeria20262027 } from "@/app/data/temporadaGaleria";
import { temporadas } from "@/app/data/temporadas";

export async function generateStaticParams() {
  return temporadas.map((temporada) => ({ id: temporada.id }));
}

export default async function TemporadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const temporada = temporadas.find((t) => t.id === id);

  if (!temporada) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {id === "2026-2027" ? (
          <section className="bg-kanot-navy-deep px-6 pt-32 pb-16 md:px-12 md:pt-40 lg:px-20">
            <div className="mx-auto max-w-6xl">
              <EquiposGrid />
              <div className="mt-16 md:mt-24">
                <GaleriaCollage images={galeria20262027} pattern={PATTERN_12} />
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-kanot-navy-deep px-6 pt-32 pb-16 md:px-12 md:pt-40 lg:px-20">
            <div className="mx-auto max-w-6xl">
              <GaleriaCollage images={galeria20252026} />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
