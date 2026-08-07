"use client";

import { useEffect, useSyncExternalStore, type MouseEvent } from "react";
import {
  animate as animateMotionValue,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

const TITLE = "ByKanot";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.1,
    },
  },
};

const letterVariants = {
  hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function subscribeFinePointer(callback: () => void) {
  const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

export default function AnimatedHeroTitle() {
  const hasFinePointer = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  );

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 15, mass: 0.4 };
  const springX = useSpring(rawX, springConfig);
  const springY = useSpring(rawY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);
  const translateX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

  const glowX = useTransform(springX, [-0.5, 0.5], [20, 80]);
  const glowY = useTransform(springY, [-0.5, 0.5], [20, 80]);
  const cursorGlow = useMotionTemplate`radial-gradient(420px circle at ${glowX}% ${glowY}%, rgba(255,176,214,0.55), transparent 70%)`;

  const glowOpacity = useMotionValue(1);
  const glowScale = useMotionValue(1);

  useEffect(() => {
    if (hasFinePointer) {
      const opacityControls = animateMotionValue(glowOpacity, 1, { duration: 0.3 });
      const scaleControls = animateMotionValue(glowScale, 1, { duration: 0.3 });
      return () => {
        opacityControls.stop();
        scaleControls.stop();
      };
    }

    const opacityControls = animateMotionValue(glowOpacity, [0.3, 0.55, 0.3], {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    });
    const scaleControls = animateMotionValue(glowScale, [0.96, 1.04, 0.96], {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return () => {
      opacityControls.stop();
      scaleControls.stop();
    };
  }, [hasFinePointer, glowOpacity, glowScale]);

  function handleMouseMove(event: MouseEvent<HTMLHeadingElement>) {
    if (!hasFinePointer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.h1
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
        transformPerspective: 800,
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative text-[18vw] sm:text-[14vw] md:text-[12vw] font-black uppercase leading-[1.15] tracking-tighter text-kanot-pink will-change-transform [transform-style:preserve-3d]"
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 blur-2xl mix-blend-screen"
        style={{ background: cursorGlow, opacity: glowOpacity, scale: glowScale }}
      />

      {TITLE.split("").map((letter, index) => (
        <span key={index} className="inline-block overflow-hidden">
          <motion.span variants={letterVariants} className="inline-block">
            {letter}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
