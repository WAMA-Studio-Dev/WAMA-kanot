import Link from "next/link";
import { temporadas } from "@/app/data/temporadas";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import Pill from "@/app/components/ui/Pill";

export default function TemporadasList() {
  return (
    <div id="temporadas" className="scroll-mt-28 py-16">
      <SectionHeading kicker="Kanot Krew" title="Temporadas" />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {temporadas.map((temporada) => (
          <Link key={temporada.id} href={`/temporadas/${temporada.id}`}>
            <GlassCard className="p-6 transition-colors hover:border-kanot-pink/40 md:p-8">
              <Pill>{temporada.periodo}</Pill>
              <h3 className="mt-4 text-2xl font-bold text-white">{temporada.titulo}</h3>
              <p className="mt-2 text-white/70">{temporada.descripcion}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
