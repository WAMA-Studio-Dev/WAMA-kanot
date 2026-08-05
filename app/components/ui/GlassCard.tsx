"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cardHoverVariants, CARD_TRANSITION, CARD_TAP } from "@/app/lib/motion";
import { useCursorGlow } from "@/app/lib/useCursorGlow";

export default function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { glowStyle, handlers } = useCursorGlow();

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap={CARD_TAP}
      variants={cardHoverVariants}
      transition={CARD_TRANSITION}
      {...handlers}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md shadow-lg shadow-black/20 ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit]"
        style={glowStyle}
      />
    </motion.div>
  );
}
