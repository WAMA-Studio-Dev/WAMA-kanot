"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { youtubeChannelUrl } from "@/app/data/podcast";
import SectionHeading from "@/app/components/ui/SectionHeading";
import CtaButton from "@/app/components/ui/CtaButton";
import MotionZoomImage from "@/app/components/ui/MotionZoomImage";
import { cardHoverVariants, CARD_TRANSITION, CARD_TAP } from "@/app/lib/motion";
import { useCursorGlow } from "@/app/lib/useCursorGlow";

export default function PodcastSection() {
  const { glowStyle, handlers } = useCursorGlow();

  return (
    <section id="podcast" className="scroll-mt-28 bg-kanot-navy px-6 py-20 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="rest"
          whileHover="hover"
          whileTap={CARD_TAP}
          variants={cardHoverVariants}
          transition={CARD_TRANSITION}
          {...handlers}
          className="relative overflow-hidden rounded-3xl border border-white/10"
        >
          <Link href="/podcast" className="block">
            <div className="relative aspect-[21/9] w-full">
              <MotionZoomImage>
                <Image
                  src="/imagenes/podcast/kanotonair.png"
                  alt="Podcast ByKanot"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={false}
                />
              </MotionZoomImage>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-kanot-navy via-kanot-navy/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 pb-24 md:p-10 md:pb-28">
              <SectionHeading kicker="Kanot" title="Podcast" />
            </div>
          </Link>
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-40">
            <CtaButton href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer">
              Ver en YouTube
            </CtaButton>
          </div>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
            style={glowStyle}
          />
        </motion.div>
      </div>
    </section>
  );
}
