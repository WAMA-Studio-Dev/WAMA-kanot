import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import { horarios } from "@/app/data/club";

export default function HorariosSection() {
  return (
    <section className="bg-kanot-navy px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <SectionHeading kicker="Clases semanales" title="Horarios" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {horarios.map((h) => (
            <GlassCard key={h.dia + h.hora} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-lg font-bold text-white">{h.dia}</p>
                <p className="text-sm text-white/60">{h.clase}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#d6127e]/20 px-3 py-1.5 text-sm font-semibold text-[#ff6fbf]">
                {h.hora}
              </span>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
