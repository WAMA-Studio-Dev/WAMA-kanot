"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { imageZoomVariants, IMAGE_TRANSITION } from "@/app/lib/motion";

export default function MotionZoomImage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={imageZoomVariants}
      transition={IMAGE_TRANSITION}
      className={`absolute inset-0 ${className}`}
    >
      {children}
    </motion.div>
  );
}
