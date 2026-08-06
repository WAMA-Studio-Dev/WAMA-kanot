"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CARD_TRANSITION } from "@/app/lib/motion";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export default function Accordion({
  items,
  expanded,
  onToggle,
}: {
  items: AccordionItem[];
  expanded: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = expanded.includes(item.id);
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-white md:text-lg">{item.title}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-kanot-pink transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={CARD_TRANSITION}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 px-5 pb-5 text-sm leading-relaxed text-white/75 md:text-base">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
