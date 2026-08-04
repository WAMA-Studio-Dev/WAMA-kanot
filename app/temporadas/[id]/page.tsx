import { notFound } from "next/navigation";
import Navbar from "@/app/components/layout/Navbar";
import PageHero from "@/app/components/sections/PageHero";
import Pill from "@/app/components/ui/Pill";
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
        <PageHero title={temporada.periodo} />
        <section className="bg-kanot-navy-deep px-6 py-16 md:px-12 lg:px-20">
          <div className="mx-auto max-w-3xl text-center">
            <Pill>{temporada.periodo}</Pill>
            <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
              {temporada.titulo}
            </h2>
            <p className="mt-4 text-base text-white/80 md:text-lg">{temporada.descripcion}</p>
          </div>
        </section>
      </main>
    </>
  );
}
