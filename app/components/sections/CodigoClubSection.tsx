import Image from "next/image";
import { clubPhotos, horarios } from "@/app/data/club";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import CtaButton from "@/app/components/ui/CtaButton";

export default function CodigoClubSection() {
  return (
    <section
      id="codigoclub"
      className="scroll-mt-28 bg-kanot-navy-deep px-6 py-20 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Club"
          title="CódigoClub"
          description="Fotos del club, horarios de clase y acceso a nuestros eventos."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-3">
            {clubPhotos.map((photo, i) => (
              <div
                key={photo}
                className={`relative overflow-hidden rounded-2xl border border-white/10 ${
                  i === 2 ? "col-span-2 aspect-[16/9] lg:col-span-1 lg:aspect-[3/4]" : "aspect-[3/4]"
                }`}
              >
                <Image
                  src={photo}
                  alt="CódigoClub"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-kanot-pink">Horarios</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {horarios.map((h) => (
                <li
                  key={`${h.dia}-${h.hora}`}
                  className="flex flex-col gap-0.5 border-b border-white/10 pb-3 last:border-0"
                >
                  <span className="text-sm font-semibold text-white">
                    {h.dia} · {h.hora}
                  </span>
                  <span className="text-sm text-white/70">{h.clase}</span>
                </li>
              ))}
            </ul>

            <CtaButton href="#formulario" className="mt-6 w-full">
              Comprar entrada
            </CtaButton>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
