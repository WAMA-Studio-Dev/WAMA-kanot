"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ScrollIndicator() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/60"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <ChevronDown className="h-7 w-7" />
    </motion.div>
  );
}
