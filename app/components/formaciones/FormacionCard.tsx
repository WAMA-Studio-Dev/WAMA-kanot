"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, GraduationCap, MapPin, Users } from "lucide-react";
import type { Formacion } from "@/app/data/formaciones";
import GlassCard from "@/app/components/ui/GlassCard";
import Pill from "@/app/components/ui/Pill";
import { EASE_OUT } from "@/app/lib/motion";
import InscripcionModal from "@/app/components/formaciones/InscripcionModal";

export default function FormacionCard({ formacion }: { formacion: Formacion }) {
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <GlassCard className="flex flex-col p-6 md:p-8">
      <div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-kanot-pink">
          {formacion.titulo}
        </h3>
        {formacion.descripcion && (
          <p className="mt-2 text-sm text-white/70">{formacion.descripcion}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{formacion.fecha}</Pill>
          <Pill>{formacion.precio}</Pill>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detalle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="mt-6 flex flex-col gap-5 border-t border-white/10 pt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2 text-sm text-white/80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-kanot-pink" />
                  <div>
                    <p className="font-semibold text-white">Ubicación</p>
                    <p className="text-white/70">{formacion.ubicacion}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/80">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-kanot-pink" />
                  <div>
                    <p className="font-semibold text-white">Nivel</p>
                    <p className="text-white/70">{formacion.nivel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/80">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-kanot-pink" />
                  <div>
                    <p className="font-semibold text-white">Profesores</p>
                    <p className="text-white/70">{formacion.profesores.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-white/80">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0 text-kanot-pink"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white">Horarios</p>
                    <p className="text-white/70">{formacion.horario}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Temario</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {formacion.temario.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-kanot-pink" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:border-kanot-pink/40 hover:text-kanot-pink"
        >
          {expanded ? "Ver menos" : "Ver más"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="ml-auto rounded-full bg-kanot-pink px-5 py-2.5 text-sm font-bold text-kanot-navy transition-colors hover:bg-white"
        >
          Apúntate
        </button>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <InscripcionModal formacion={formacion} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
