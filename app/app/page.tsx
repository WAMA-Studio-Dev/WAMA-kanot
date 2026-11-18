"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ChevronRight,
  FolderOpen,
  GraduationCap,
  Images,
  Info,
  Music2,
  PenLine,
  Tent,
  Ticket,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { APARTADOS, SUBSECCIONES_CREW, getSeccion } from "./_components/secciones";
import { useAuth } from "./_components/AuthProvider";
import InstalarApp from "./_components/InstalarApp";
import EstaSemana from "./_components/EstaSemana";

export default function InicioApp() {
  const { esEditor, esCrew } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <InstalarApp />

      <EstaSemana />

      <h2 className="mt-2 text-2xl font-black tracking-tight">Explora</h2>

      {/* Kanot Crew (solo miembros, editores y admins): agrupa Horarios, Competición y Formaciones */}
      {esCrew && (
        <TarjetaGrupo
          href="/app/kanot-crew"
          titulo="Kanot Crew"
          subtitulo="El grupo de competición"
          icono={<UsersRound size={24} />}
          estilo="kanot"
          accesos={SUBSECCIONES_CREW.map((slug) => {
            const s = getSeccion(slug)!;
            return { href: `/app/kanot-crew?tab=${slug}`, nombre: s.nombre, icono: s.icono };
          })}
        />
      )}

      <TarjetaGrupo
        href="/app/kodigo-klub"
        titulo="Kodigo Klub"
        subtitulo="Eventos, fiestas y cultura urbana"
        icono={<Music2 size={24} />}
        estilo="kodigo"
        accesos={[
          { href: "/app/kodigo-klub?tab=que-es", nombre: "Qué es", icono: Info },
          { href: "/app/kodigo-klub?tab=ediciones", nombre: "Ediciones", icono: Images },
          { href: "/app/kodigo-klub?tab=entradas", nombre: "Entradas", icono: Ticket },
        ]}
      />

      <TarjetaGrupo
        href="/app/kanot-kamp"
        titulo="Kanot Kamp"
        subtitulo="Campus, convivencias e intensivos"
        icono={<Tent size={24} />}
        estilo="kamp"
        accesos={[
          { href: "/app/kanot-kamp?tab=que-es", nombre: "Qué es", icono: Info },
          { href: "/app/kanot-kamp?tab=profesores", nombre: "Profesores", icono: GraduationCap },
          { href: "/app/kanot-kamp?tab=inscribete", nombre: "Inscríbete", icono: PenLine },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {APARTADOS.filter((s) => esEditor || s.href !== "/app/agencia").map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex min-h-32 flex-col justify-between gap-3 rounded-3xl border border-white/10 bg-black/25 p-3 transition hover:border-kanot-pink/60 hover:bg-black/35 sm:min-h-36 sm:p-4"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
              <s.icono size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight sm:text-base">{s.nombre}</span>
              <span className="mt-1 block text-xs leading-snug text-white/55">{s.descripcion}</span>
            </span>
          </Link>
        ))}
      </div>

      {esEditor && (
        <Link
          href="/app/archivos"
          className="flex items-center gap-4 rounded-3xl border border-kanot-electric/30 bg-kanot-electric/10 p-4 transition hover:bg-kanot-electric/15"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-kanot-electric/20 text-kanot-electric">
            <FolderOpen size={22} />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">Gestor de archivos</span>
            <span className="block text-xs text-white/55">Excels, PDFs, fotos y documentos internos · solo equipo</span>
          </span>
          <ChevronRight className="text-white/40" />
        </Link>
      )}
    </div>
  );
}

const ESTILOS = {
  kanot: {
    caja: "border-kanot-pink/30 bg-gradient-to-br from-kanot-pink/15 to-black/25",
    icono: "bg-kanot-pink text-kanot-navy-deep",
    acceso: "text-kanot-pink",
  },
  kodigo: {
    caja: "border-[#d6127e]/40 bg-gradient-to-br from-[#9c1e53]/60 to-black/25",
    icono: "bg-[#d6127e] text-white",
    acceso: "text-[#ff5fb0]",
  },
  kamp: {
    caja: "border-kanot-electric/35 bg-gradient-to-br from-kanot-electric/20 to-black/25",
    icono: "bg-kanot-electric text-kanot-navy-deep",
    acceso: "text-kanot-electric",
  },
};

/** Tarjeta destacada que agrupa varios apartados con accesos directos. */
function TarjetaGrupo({
  href,
  titulo,
  subtitulo,
  icono,
  estilo,
  accesos,
}: {
  href: string;
  titulo: string;
  subtitulo: string;
  icono: ReactNode;
  estilo: keyof typeof ESTILOS;
  accesos: { href: string; nombre: string; icono: LucideIcon }[];
}) {
  const e = ESTILOS[estilo];
  return (
    <section className={`overflow-hidden rounded-3xl border ${e.caja}`}>
      <Link href={href} className="flex items-center gap-3 p-4 pb-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${e.icono}`}>{icono}</span>
        <span className="flex-1">
          <span className="block text-lg font-bold leading-tight">{titulo}</span>
          <span className="block text-xs text-white/60">{subtitulo}</span>
        </span>
        <ChevronRight className="text-white/40" />
      </Link>
      <div className={`grid gap-2 px-4 pb-4 ${accesos.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {accesos.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-black/25 px-1 py-3 text-center text-xs font-medium transition hover:bg-black/40"
          >
            <a.icono size={20} className={e.acceso} />
            <span className="max-w-full truncate">{a.nombre}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
