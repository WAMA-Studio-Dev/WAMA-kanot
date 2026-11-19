"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "../_components/AuthProvider";
import { GRUPOS } from "../_components/secciones";
import { Aviso, Cargando } from "../_components/ui";

type Stats = {
  roles: Record<string, number>;
  grupos: Record<string, number>;
  activos_hoy: number;
  activos_7: number;
  activos_30: number;
  instalada_30: number;
  notis_activas: number;
  desde_noti_30: number;
  apartados_30: Record<string, number>;
  por_dia: { dia: string; n: number }[];
  autorizaciones: number;
  galeria: number;
  avisos: number;
};

const NOMBRE_APARTADO: Record<string, string> = {
  inicio: "Inicio",
  "kanot-crew": "Kanot Crew",
  "kodigo-klub": "Kodigo Klub",
  "kanot-kamp": "Kanot Kamp",
  podcast: "Podcast",
  merch: "Merch",
  agencia: "Agencia",
  fotografia: "Fotografía",
  perfil: "Perfil",
  usuarios: "Usuarios",
  archivos: "Archivos",
  autorizacion: "Autorizaciones",
  estadisticas: "Estadísticas",
};
const NOMBRE_ROL: Record<string, string> = {
  pendiente: "Pendientes",
  usuario: "Usuarios",
  miembro: "Miembros",
  editor: "Editores",
  admin: "Admins",
};

/** Estadísticas de uso de la app (solo admins). */
export default function PaginaEstadisticas() {
  const { esAdmin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!esAdmin) return;
    getSupabase()
      .rpc("estadisticas")
      .then(({ data, error }) => {
        if (error) setError(/estadisticas|schema cache/i.test(error.message) ? "Falta activar las estadísticas (SQL 012)." : error.message);
        else setStats(data as Stats);
      });
  }, [esAdmin]);

  if (!esAdmin) return <Aviso>Esta sección es solo para administradores.</Aviso>;

  const total = stats ? Object.entries(stats.roles).reduce((n, [r, v]) => (r === "pendiente" ? n : n + v), 0) : 0;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
          <BarChart3 size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Estadísticas</h1>
          <p className="text-sm text-white/55">Cómo se está usando la app</p>
        </div>
      </div>

      {error && <Aviso>{error}</Aviso>}
      {!stats && !error && <Cargando />}

      {stats && (
        <>
          {/* Cifras principales */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Cifra valor={stats.activos_hoy} etiqueta="Activos hoy" />
            <Cifra valor={stats.activos_7} etiqueta="Últimos 7 días" />
            <Cifra valor={stats.activos_30} etiqueta="Últimos 30 días" />
            <Cifra valor={total} etiqueta="Cuentas con acceso" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Cifra valor={stats.instalada_30} etiqueta="Tienen la app instalada" detalle={`${pct(stats.instalada_30)} % de las cuentas`} />
            <Cifra valor={stats.notis_activas} etiqueta="Con notificaciones" detalle={`${pct(stats.notis_activas)} % de las cuentas`} />
            <Cifra valor={stats.desde_noti_30} etiqueta="Abiertas desde una notificación" detalle="últimos 30 días" />
          </div>

          <Tarjeta titulo="Personas activas por día" subtitulo="Últimos 14 días">
            <BarrasDias datos={stats.por_dia} />
          </Tarjeta>

          <Tarjeta titulo="Apartados más usados" subtitulo="Personas distintas, últimos 30 días">
            <BarrasHorizontales
              filas={Object.entries(stats.apartados_30)
                .map(([k, n]) => ({ nombre: NOMBRE_APARTADO[k] ?? k, n }))
                .sort((a, b) => b.n - a.n)}
            />
          </Tarjeta>

          <div className="grid gap-3 sm:grid-cols-2">
            <Tarjeta titulo="Cuentas por rol">
              <ul className="flex flex-col gap-1.5 text-sm">
                {["pendiente", "usuario", "miembro", "editor", "admin"].map((r) => (
                  <li key={r} className="flex justify-between">
                    <span className="text-white/70">{NOMBRE_ROL[r]}</span>
                    <span className="font-semibold tabular-nums">{stats.roles[r] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </Tarjeta>
            <Tarjeta titulo="Miembros por grupo">
              <ul className="flex flex-col gap-1.5 text-sm">
                {[...GRUPOS.filter((g) => g.nombre !== "Todos juntos").map((g) => g.nombre), "Sin grupo"].map((g) => (
                  <li key={g} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white/70">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: GRUPOS.find((x) => x.nombre === g)?.color ?? "rgba(255,255,255,0.3)" }}
                      />
                      {g}
                    </span>
                    <span className="font-semibold tabular-nums">{stats.grupos[g] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </Tarjeta>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Cifra valor={stats.autorizaciones} etiqueta="Autorizaciones subidas" pequena />
            <Cifra valor={stats.galeria} etiqueta="Fotos y vídeos" pequena />
            <Cifra valor={stats.avisos} etiqueta="Avisos publicados" pequena />
          </div>

          <p className="text-center text-[11px] text-white/40">
            Solo se cuenta qué días entra cada persona y en qué apartados. Los datos empiezan a contar desde hoy.
          </p>
        </>
      )}
    </div>
  );
}

function Cifra({ valor, etiqueta, detalle, pequena }: { valor: number; etiqueta: string; detalle?: string; pequena?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <p className={`font-black tabular-nums leading-none ${pequena ? "text-2xl" : "text-4xl"}`}>{valor}</p>
      <p className="mt-2 text-xs font-semibold text-white/70">{etiqueta}</p>
      {detalle && <p className="text-[11px] text-white/45">{detalle}</p>}
    </div>
  );
}

function Tarjeta({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/25 p-4">
      <h2 className="font-bold">{titulo}</h2>
      {subtitulo && <p className="mb-3 text-xs text-white/50">{subtitulo}</p>}
      {!subtitulo && <div className="mb-3" />}
      {children}
    </section>
  );
}

/** Barras verticales, una por día (rellena los días sin actividad con 0). */
function BarrasDias({ datos }: { datos: { dia: string; n: number }[] }) {
  const mapa = new Map(datos.map((d) => [d.dia, d.n]));
  const dias = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { iso, etiqueta: String(d.getDate()), n: mapa.get(iso) ?? 0 };
  });
  const max = Math.max(1, ...dias.map((d) => d.n));
  if (!datos.length) return <p className="text-sm text-white/50">Todavía no hay datos.</p>;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-32 items-end gap-[2px]" role="img" aria-label="Personas activas por día">
        {dias.map((d) => (
          <div key={d.iso} className="group relative flex h-full flex-1 items-end" title={`${d.iso}: ${d.n} personas`}>
            <div
              className="w-full rounded-t-[4px] bg-kanot-pink transition-opacity group-hover:opacity-80"
              style={{ height: `${(d.n / max) * 100}%`, minHeight: d.n ? 4 : 0 }}
            />
            <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-kanot-navy-deep group-hover:block">
              {d.n}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-[2px] border-t border-white/15 pt-1">
        {dias.map((d, i) => (
          <span key={d.iso} className="flex-1 text-center text-[9px] text-white/40">
            {i % 2 === 1 || i === 13 ? d.etiqueta : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Barras horizontales con el nombre y el número al lado. */
function BarrasHorizontales({ filas }: { filas: { nombre: string; n: number }[] }) {
  if (!filas.length) return <p className="text-sm text-white/50">Todavía no hay datos.</p>;
  const max = Math.max(1, ...filas.map((f) => f.n));
  return (
    <ul className="flex flex-col gap-2">
      {filas.map((f) => (
        <li key={f.nombre} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-xs" title={`${f.nombre}: ${f.n}`}>
          <span className="truncate text-white/70">{f.nombre}</span>
          <span className="h-3 overflow-hidden rounded-r-[4px] bg-white/5">
            <span className="block h-full rounded-r-[4px] bg-kanot-pink" style={{ width: `${(f.n / max) * 100}%` }} />
          </span>
          <span className="text-right font-semibold tabular-nums">{f.n}</span>
        </li>
      ))}
    </ul>
  );
}
