import Image from "next/image";
import { formaciones } from "@/app/data/formaciones";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import Pill from "@/app/components/ui/Pill";

export default function FormacionesSection() {
  return (
    <section
      id="formaciones"
      className="scroll-mt-28 bg-kanot-navy-deep px-6 py-20 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="ByKanot"
          title="Formaciones"
          description="Formaciones que iremos anunciando durante la temporada 2026/2027."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {formaciones.map((f) => (
            <GlassCard key={f.id} className="overflow-hidden">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={f.foto}
                  alt={f.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Pill>{f.fecha}</Pill>
                  <Pill>{f.precio}</Pill>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{f.titulo}</h3>
                {f.descripcion && (
                  <p className="mt-2 text-sm text-white/70">{f.descripcion}</p>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
