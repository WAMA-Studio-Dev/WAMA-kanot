"use client";

import { animate, useMotionTemplate, useMotionValue } from "framer-motion";
import type { PointerEvent } from "react";
import { NEON_PINK_RGB } from "@/app/lib/motion";

type CursorGlowOptions = {
  size?: number;
  color?: string;
  maxOpacity?: number;
};

export function useCursorGlow({
  size = 260,
  color = NEON_PINK_RGB,
  maxOpacity = 0.55,
}: CursorGlowOptions = {}) {
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useMotionValue(0);

  const background = useMotionTemplate`radial-gradient(${size}px circle at ${glowX}% ${glowY}%, rgba(${color}, ${maxOpacity}), transparent 70%)`;

  function updatePosition(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    glowX.set(((event.clientX - rect.left) / rect.width) * 100);
    glowY.set(((event.clientY - rect.top) / rect.height) * 100);
  }

  function show(event: PointerEvent<HTMLElement>) {
    updatePosition(event);
    animate(glowOpacity, 1, { duration: 0.25 });
  }

  function hide() {
    animate(glowOpacity, 0, { duration: 0.25 });
  }

  return {
    glowStyle: { background, opacity: glowOpacity },
    handlers: {
      onPointerEnter: show,
      onPointerMove: updatePosition,
      onPointerDown: show,
      onPointerLeave: hide,
      onPointerUp: hide,
    },
  };
}
