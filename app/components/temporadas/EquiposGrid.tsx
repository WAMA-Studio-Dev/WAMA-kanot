"use client";

import { useState } from "react";
import Image from "next/image";
import { equipos, type Equipo } from "@/app/data/equipos";

function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l2.6 6.2L21 9l-5 4.4L17.4 20 12 16.6 6.6 20 8 13.4 3 9l6.4-.8z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className, direction }: { className?: string; direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EquipoModal({ equipo, onClose }: { equipo: Equipo; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = equipo.galeria.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-kanot-navy shadow-xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 text-white/80 transition-colors hover:text-kanot-pink"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <div className="relative aspect-[4/3] w-full bg-kanot-navy-deep">
          <Image
            src={equipo.galeria[index]}
            alt={`Galería de ${equipo.nombre}`}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + equipo.galeria.length) % equipo.galeria.length)}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
              >
                <ChevronIcon direction="left" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % equipo.galeria.length)}
                aria-label="Foto siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
              >
                <ChevronIcon direction="right" className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-kanot-pink-soft">
            {equipo.rango}
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-kanot-pink md:text-3xl">
            {equipo.nombre}
          </h3>
          <p className="mt-3 text-sm text-white/70 md:text-base">
            Galería de fotos próximamente. {equipo.descripcion}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EquiposGrid() {
  const [equipoActivo, setEquipoActivo] = useState<Equipo | null>(null);

  return (
    <div>
      <div className="relative flex items-center justify-center">
        <p className="absolute right-full mr-6 hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.3em] text-white/40 lg:block">
          Temporada
        </p>
        <h2 className="text-center text-4xl font-black uppercase tracking-tight text-kanot-pink sm:text-5xl md:text-6xl">
          Equipos
        </h2>
        <p className="absolute left-full ml-6 hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.3em] text-white/40 lg:block">
          2026 / 2027
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {equipos.map((equipo) => (
          <div
            key={equipo.id}
            className="relative flex flex-col overflow-visible rounded-[2rem] border border-white/10 bg-white/5 p-6 pt-16 backdrop-blur-md"
          >
            <span className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-kanot-pink px-3 py-1 text-xs font-bold uppercase tracking-wide text-kanot-navy">
              <BadgeIcon className="h-3.5 w-3.5" />
              {equipo.categoria}
            </span>

            <div className="relative z-10 mb-2 flex justify-center">
              <div className="relative h-36 w-36 scale-110 drop-shadow-2xl sm:h-40 sm:w-40">
                <Image
                  src={equipo.imagen}
                  alt={equipo.nombre}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            </div>

            <p className="flex-1 text-center text-sm text-white/70 md:text-left">
              {equipo.descripcion}
            </p>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-lg font-bold text-white">{equipo.nombre}</p>
                <p className="text-xs text-white/60">{equipo.rango}</p>
              </div>
              <button
                type="button"
                onClick={() => setEquipoActivo(equipo)}
                className="shrink-0 rounded-full bg-kanot-pink px-4 py-2 text-sm font-bold text-kanot-navy transition-colors hover:bg-white"
              >
                Ver más
              </button>
            </div>
          </div>
        ))}
      </div>

      {equipoActivo && (
        <EquipoModal equipo={equipoActivo} onClose={() => setEquipoActivo(null)} />
      )}
    </div>
  );
}
