"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CARD_TRANSITION } from "@/app/lib/motion";

type CtaButtonProps = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "solid" | "outline" | "glow";
  target?: string;
  rel?: string;
  className?: string;
};

const GLOW_SHADOW = "0 0 15px rgba(255, 64, 129, 0.6)";

export default function CtaButton({
  href,
  onClick,
  children,
  variant = "solid",
  target,
  rel,
  className = "",
}: CtaButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 font-bold transition-colors";
  const styles =
    variant === "solid"
      ? "bg-kanot-pink text-kanot-navy hover:bg-white"
      : variant === "glow"
        ? "bg-kanot-pink text-kanot-navy"
        : "border border-kanot-pink/40 text-kanot-pink hover:bg-kanot-pink hover:text-kanot-navy";
  const isGlow = variant === "glow";
  const motionProps = {
    whileHover: isGlow ? { scale: 1.05, boxShadow: GLOW_SHADOW } : undefined,
    whileTap: isGlow ? { scale: 0.95, boxShadow: GLOW_SHADOW } : undefined,
    transition: isGlow ? CARD_TRANSITION : undefined,
    className: `${base} ${styles} ${className}`,
  };

  if (!href) {
    return (
      <motion.button type="button" onClick={onClick} {...motionProps}>
        {children}
      </motion.button>
    );
  }

  return (
    <motion.a href={href} target={target} rel={rel} onClick={onClick} {...motionProps}>
      {children}
    </motion.a>
  );
}
