"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function ScrollIndicator() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
    >
      {/* Mobile: neon pill with a sliding dot */}
      <motion.div
        className="flex h-9 w-6 items-start justify-center rounded-full border border-kanot-pink/50 p-1.5 shadow-[0_0_12px_rgba(255,64,129,0.5)] sm:hidden"
        animate={{ boxShadow: ["0 0 8px rgba(255,64,129,0.4)", "0 0 16px rgba(255,64,129,0.75)", "0 0 8px rgba(255,64,129,0.4)"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-kanot-pink"
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Desktop: bouncing chevron with neon glow */}
      <motion.div
        className="hidden text-kanot-pink drop-shadow-[0_0_10px_rgba(255,64,129,0.6)] sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-7 w-7" />
      </motion.div>
    </div>
  );
}
