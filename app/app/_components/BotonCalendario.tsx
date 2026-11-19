"use client";

import { CalendarPlus } from "lucide-react";
import type { Entrada } from "./secciones";

/** Añadir un ensayo o campeonato al calendario del móvil (con aviso 2 horas antes). */
export default function BotonCalendario({ entrada, prefijo, texto }: { entrada: Entrada; prefijo?: string; texto?: string }) {
  if (!entrada.fecha) return null;
  const q = new URLSearchParams({
    titulo: prefijo ? `${prefijo} · ${entrada.titulo}` : entrada.titulo,
    fecha: entrada.fecha,
    ...(entrada.hora ? { hora: entrada.hora } : {}),
    ...(entrada.lugar ? { lugar: entrada.lugar } : {}),
  });
  return (
    <a
      href={`/api/calendario?${q}`}
      aria-label="Añadir a mi calendario"
      title="Añadir a mi calendario"
      className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/15 hover:text-white"
    >
      <CalendarPlus size={14} />
      {texto}
    </a>
  );
}
