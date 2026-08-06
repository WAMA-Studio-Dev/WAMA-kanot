"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Disc3, GraduationCap, Home, Mail, Mic2, X } from "lucide-react";
import { useContactModal } from "@/app/components/contacto/ContactModalContext";

const links = [
  { label: "Volver a ByKanot", href: "/", icon: Home },
  { label: "Formaciones", href: "/formaciones", icon: GraduationCap },
  { label: "Podcast", href: "/podcast", icon: Mic2 },
];

export default function KodigoKlubFloatingNav() {
  const [open, setOpen] = useState(false);
  const { openModal } = useContactModal();

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col items-end gap-3 md:right-6 md:top-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-end gap-1 rounded-2xl border border-[#d6127e]/30 bg-black/90 p-2 shadow-xl shadow-black/50 backdrop-blur-md"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-end gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-[#9c1e53] hover:text-white"
              >
                {link.label}
                <link.icon className="h-4 w-4 text-[#d6127e]" />
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openModal();
              }}
              className="flex w-full items-center justify-end gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-[#9c1e53] hover:text-white"
            >
              Contacto
              <Mail className="h-4 w-4 text-[#d6127e]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d6127e]/40 bg-black text-[#d6127e] shadow-[0_0_20px_rgba(214,18,126,0.5)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="disc"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="flex"
            >
              <Disc3 className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
