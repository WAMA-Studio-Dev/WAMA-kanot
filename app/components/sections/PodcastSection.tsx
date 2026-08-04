import Image from "next/image";
import { invitados, youtubeChannelUrl } from "@/app/data/podcast";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import CtaButton from "@/app/components/ui/CtaButton";

export default function PodcastSection() {
  return (
    <section id="podcast" className="scroll-mt-28 bg-kanot-navy px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=1600&auto=format&fit=crop"
              alt="Podcast ByKanot"
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-kanot-navy via-kanot-navy/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-4 p-6 md:p-10">
            <SectionHeading kicker="Kanot" title="Podcast" />
            <CtaButton href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer">
              Ver en YouTube
            </CtaButton>
          </div>
        </div>

        <h3 className="mt-14 text-xl font-bold text-white">Invitados</h3>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {invitados.map((invitado) => (
            <GlassCard key={invitado.id} className="overflow-hidden">
              <div className="relative aspect-square w-full">
                <Image
                  src={invitado.foto}
                  alt={invitado.nombre}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="font-bold text-kanot-pink">{invitado.nombre}</p>
                <p className="text-xs text-white/70">{invitado.rol}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
