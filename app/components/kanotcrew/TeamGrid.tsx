import Image from "next/image";
import Link from "next/link";
import { teamMembers } from "@/app/data/team";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import MotionZoomImage from "@/app/components/ui/MotionZoomImage";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";

export default function TeamGrid() {
  return (
    <div id="quienes-lo-llevamos" className="scroll-mt-28 py-16">
      <SectionHeading
        title="¿Qué es ByKanot?"
        description="Podcast, Grupos de competición, Formación dancística con profesionales, creación de contenido y proyectos que impulsan la cultura urbana, ofreciendo oportunidades para bailarines de todos los niveles que quieran evolucionar tanto dentro como fuera del escenario."
      />

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {teamMembers.map((member) => (
          <GlassCard key={member.id} className="overflow-hidden">
            <Link href={`/quienes-lo-llevamos#${member.id}`} className="block">
              <div className="relative aspect-[3/4] w-full">
                <MotionZoomImage>
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </MotionZoomImage>
              </div>
            </Link>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/quienes-lo-llevamos#${member.id}`}
                  className="text-lg font-bold text-kanot-pink hover:underline"
                >
                  {member.name}
                </Link>
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Instagram de ${member.name}`}
                  className="shrink-0 text-white/70 hover:text-kanot-pink active:text-kanot-pink transition-colors"
                >
                  <InstagramIcon className="h-[18px] w-[18px]" />
                </a>
              </div>
              <p className="text-xs md:text-sm text-white/70">{member.role}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
