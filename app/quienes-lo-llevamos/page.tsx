import Image from "next/image";
import Navbar from "@/app/components/layout/Navbar";
import PageHero from "@/app/components/sections/PageHero";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import { teamMembers } from "@/app/data/team";

export default function QuienesLoLlevamosPage() {
  const ariadna = teamMembers.find((member) => member.id === "ariadna")!;
  const eric = teamMembers.find((member) => member.id === "enrique")!;
  const diego = teamMembers.find((member) => member.id === "crew-4")!;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          title="Quienes Somos"
          description={[
            "No creemos que el baile sea solo ganar competiciones. Creemos en entrenar con disciplina, disfrutar del proceso, respetar la cultura y crecer junto a personas que comparten la misma pasión.",
          ]}
        />

        <section className="bg-kanot-navy px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <div
              id={ariadna.id}
              className="grid scroll-mt-28 grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16"
            >
              <div className="flex justify-center">
                <div className="relative aspect-square w-72 overflow-hidden rounded-3xl border border-white/10 shadow-lg shadow-black/20 sm:w-96">
                  <Image
                    src={ariadna.photo}
                    alt={ariadna.name}
                    fill
                    sizes="(max-width: 640px) 256px, 320px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 text-center md:text-left">
                <h1 className="text-4xl font-black uppercase tracking-tight text-kanot-pink sm:text-5xl md:text-6xl">
                  Ariadna González
                </h1>
                <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-kanot-pink-soft md:justify-start md:text-xl">
                  Coreógrafa · CEO ·
                  <a
                    href={ariadna.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${ariadna.name}`}
                    className="text-kanot-pink-soft hover:text-kanot-pink transition-colors"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                </h2>
                <p className="text-base text-white/80">
                  Profesora de danza en Sevilla, impartiendo formación en diferentes escuelas y
                  proyectos dedicados a la <strong>danza urbana</strong>. Con 22 años, soy graduada
                  en Criminología y <strong>CEO y cofundadora de ByKanot</strong>, un proyecto
                  centrado en la formación, la competición y la creación de una comunidad para
                  bailarines.
                </p>
                <p className="text-base text-white/80">
                  Además de mi labor como docente, trabajo como{" "}
                  <strong>coreógrafa y bailarina profesional</strong> en orquestas, tributos y
                  eventos por España.
                </p>
              </div>
            </div>

            <div
              id={eric.id}
              className="grid scroll-mt-28 grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16"
            >
              <div className="flex justify-center md:order-2">
                <div className="relative aspect-square w-72 overflow-hidden rounded-3xl border border-white/10 shadow-lg shadow-black/20 sm:w-96">
                  <Image
                    src={eric.photo}
                    alt={eric.name}
                    fill
                    sizes="(max-width: 640px) 256px, 320px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 text-center md:order-1 md:text-left">
                <h1 className="text-4xl font-black uppercase tracking-tight text-kanot-pink sm:text-5xl md:text-6xl">
                  Eric Domínguez
                </h1>
                <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-kanot-pink-soft md:justify-start md:text-xl">
                  Coreógrafo · CEO ·
                  <a
                    href={eric.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${eric.name}`}
                    className="text-kanot-pink-soft hover:text-kanot-pink transition-colors"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                </h2>
                <p className="text-base text-white/80">
                  Bailarín y profesor de danza en Sevilla. Tengo 18 años y estoy graduado en el
                  bachillerato de Artes Escénicas, soy{" "}
                  <strong>CEO y cofundador de ByKanot</strong>, un proyecto centrado en la
                  formación, la competición y la creación de una comunidad para bailarines.
                </p>
                <p className="text-base text-white/80">
                  Actualmente me formo todo lo posible en danza e imparto clase, además de{" "}
                  <strong>co-coreografiar los grupos de competición</strong>.
                </p>
              </div>
            </div>

            <div
              id={diego.id}
              className="grid scroll-mt-28 grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16"
            >
              <div className="flex justify-center">
                <div className="relative aspect-square w-72 overflow-hidden rounded-3xl border border-white/10 shadow-lg shadow-black/20 sm:w-96">
                  <Image
                    src={diego.photo}
                    alt={diego.name}
                    fill
                    sizes="(max-width: 640px) 256px, 320px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 text-center md:text-left">
                <h1 className="text-4xl font-black uppercase tracking-tight text-kanot-pink sm:text-5xl md:text-6xl">
                  Diego Gómez
                </h1>
                <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-kanot-pink-soft md:justify-start md:text-xl">
                  Dirección y coordinación ·
                  <a
                    href={diego.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${diego.name}`}
                    className="text-kanot-pink-soft hover:text-kanot-pink transition-colors"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                </h2>
                <p className="text-base text-white/80">
                  Bailarín y profesor de danza en Sevilla. Tengo 19 años y compagino diferentes
                  proyectos de danza junto a mis estudios de fotografía. Formo parte del{" "}
                  <strong>equipo directivo del proyecto ByKanot</strong>, un proyecto centrado en
                  la formación, la competición y la creación de una comunidad para bailarines.
                </p>
                <p className="text-base text-white/80">
                  En este momento de mi vida priorizo explotar mi creatividad al máximo{" "}
                  <strong>coreografiando y creando nuevos proyectos</strong>, además de formarme
                  en todo lo que pueda.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
