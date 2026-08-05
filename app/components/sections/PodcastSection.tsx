import Image from "next/image";
import Link from "next/link";
import { youtubeChannelUrl } from "@/app/data/podcast";
import SectionHeading from "@/app/components/ui/SectionHeading";
import CtaButton from "@/app/components/ui/CtaButton";

export default function PodcastSection() {
  return (
    <section id="podcast" className="scroll-mt-28 bg-kanot-navy px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <Link href="/podcast" className="block">
            <div className="relative aspect-[21/9] w-full">
              <Image
                src="/imagenes/podcast/kanotonair.png"
                alt="Podcast ByKanot"
                fill
                sizes="100vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-kanot-navy via-kanot-navy/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 pb-24 md:p-10 md:pb-28">
              <SectionHeading kicker="Kanot" title="Podcast" />
            </div>
          </Link>
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
            <CtaButton href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer">
              Ver en YouTube
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
