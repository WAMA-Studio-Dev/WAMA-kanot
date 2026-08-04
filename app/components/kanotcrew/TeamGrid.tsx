import Image from "next/image";
import { teamMembers } from "@/app/data/team";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";

export default function TeamGrid() {
  return (
    <div id="quienes-lo-llevamos" className="scroll-mt-28 py-16">
      <SectionHeading
        kicker="KanotCrew"
        title="Quiénes lo llevamos"
        description="El equipo detrás de Kanot: dirección, competición, formación y contenido."
      />

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {teamMembers.map((member) => (
          <GlassCard key={member.id} className="overflow-hidden">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={member.photo}
                alt={member.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-lg font-bold text-kanot-pink">{member.name}</p>
              <p className="text-xs md:text-sm text-white/70">{member.role}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
