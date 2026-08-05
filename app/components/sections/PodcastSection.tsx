import Image from "next/image";
import { youtubeChannelUrl } from "@/app/data/podcast";
import SectionHeading from "@/app/components/ui/SectionHeading";
import CtaButton from "@/app/components/ui/CtaButton";

export default function PodcastSection() {
  return (
    <section id="podcast" className="scroll-mt-28 bg-kanot-navy px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="/imagenes/podcast/portada-podcast.jpg"
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
      </div>
    </section>
  );
}
