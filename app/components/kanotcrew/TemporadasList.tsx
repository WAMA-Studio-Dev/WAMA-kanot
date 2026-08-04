import { temporadas } from "@/app/data/temporadas";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import Pill from "@/app/components/ui/Pill";

export default function TemporadasList() {
  return (
    <div id="temporadas" className="scroll-mt-28 py-16">
      <SectionHeading kicker="KanotCrew" title="Temporadas" />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {temporadas.map((temporada) => (
          <GlassCard key={temporada.id} className="p-6 md:p-8">
            <Pill>{temporada.periodo}</Pill>
            <h3 className="mt-4 text-2xl font-bold text-white">{temporada.titulo}</h3>
            <p className="mt-2 text-white/70">{temporada.descripcion}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
