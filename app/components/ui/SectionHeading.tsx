"use client";

import { motion } from "framer-motion";
import { fadeUpVariants, REVEAL_TRANSITION } from "@/app/lib/motion";

export default function SectionHeading({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      className="max-w-3xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUpVariants}
      transition={REVEAL_TRANSITION}
    >
      {kicker && (
        <p className="mb-3 text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-kanot-pink-soft">
          {kicker}
        </p>
      )}
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-kanot-pink">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base md:text-lg text-white/80">{description}</p>
      )}
    </motion.div>
  );
}
