"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { GRUPOS } from "./secciones";
import { TIPOS_NOTI } from "./notificaciones";

type Datos = {
  por_rol: { rol: string; total: number; activas: number }[];
  por_grupo: { grupo: string; total: number; activas: number }[];
  desactivadas: Record<string, number>;
  sin_notis: { nombre: string; grupo: string | null }[];
};

const NOMBRE_ROL: Record<string, string> = { usuario: "Usuarios", miembro: "Miembros", editor: "Editores", admin: "Admins" };

/** Estadísticas: quién tiene las notificaciones activadas, por grupo, y a quién insistir. */
export default function EstadisticasNotis() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verLista, setVerLista] = useState(false);

  useEffect(() => {
    getSupabase()
      .rpc("estadisticas_notis")
      .then(({ data, error }) => {
        if (error) setError(/estadisticas_notis|schema cache/i.test(error.message) ? "Falta activar el SQL 025." : error.message);
        else setDatos(data as Datos);
      });
  }, []);

  const filaBarra = (nombre: string, activas: number, total: number, color?: string) => {
    const pct = total ? Math.round((activas / total) * 100) : 0;
    return (
      <li key={nombre} className="grid grid-cols-[6.5rem_1fr_4.5rem] items-center gap-2 text-xs">
        <span className="flex items-center gap-1.5 truncate text-white/70">
          {color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
          {nombre}
        </span>
        <span className="h-3 overflow-hidden rounded-r-[4px] bg-white/5">
          <span className={`block h-full rounded-r-[4px] ${pct < 50 ? "bg-amber-300" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
        </span>
        <span className="text-right font-semibold tabular-nums">
          {activas}/{total} <span className="text-white/45">· {pct}%</span>
        </span>
      </li>
    );
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/25 p-4">
      <div>
        <h2 className="flex items-center gap-2 font-bold">
          <Bell size={18} className="text-kanot-pink" /> Notificaciones
        </h2>
        <p className="text-xs text-white/50">Quién las tiene activadas en su móvil</p>
      </div>
      {error && <p className="text-xs text-red-200">{error}</p>}
      {!datos && !error && <p className="text-sm text-white/50">Cargando…</p>}
      {datos && (
        <>
          <ul className="flex flex-col gap-2">
            {["miembro", "usuario", "editor", "admin"]
              .map((r) => datos.por_rol.find((x) => x.rol === r))
              .filter((x): x is NonNullable<typeof x> => Boolean(x))
              .map((x) => filaBarra(NOMBRE_ROL[x.rol] ?? x.rol, x.activas, x.total))}
          </ul>

          {datos.por_grupo.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/50">Miembros por grupo</p>
              <ul className="flex flex-col gap-2">
                {[...GRUPOS.filter((g) => g.nombre !== "Todos juntos").map((g) => g.nombre), "Sin grupo"]
                  .map((g) => datos.por_grupo.find((x) => x.grupo === g))
                  .filter((x): x is NonNullable<typeof x> => Boolean(x))
                  .map((x) => filaBarra(x.grupo, x.activas, x.total, GRUPOS.find((g) => g.nombre === x.grupo)?.color))}
              </ul>
            </div>
          )}

          {datos.sin_notis.length > 0 && (
            <div className="rounded-2xl bg-amber-300/10 p-3">
              <button type="button" onClick={() => setVerLista((v) => !v)} className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold">
                <span>
                  {datos.sin_notis.length} {datos.sin_notis.length === 1 ? "miembro" : "miembros"} sin notificaciones
                </span>
                <ChevronDown size={16} className={`transition ${verLista ? "rotate-180" : ""}`} />
              </button>
              {verLista && (
                <ul className="mt-2 flex flex-col gap-1 text-xs text-white/75">
                  {datos.sin_notis.map((p, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">{p.nombre}</span>
                      <span className="shrink-0 text-white/45">{p.grupo ?? "Sin grupo"}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[11px] text-white/45">A estas personas no les llegan los avisos ni los recordatorios: mejor recordárselo por WhatsApp.</p>
            </div>
          )}

          {Object.keys(datos.desactivadas).length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-white/50">Avisos que han desactivado</p>
              <ul className="flex flex-wrap gap-1.5">
                {Object.entries(datos.desactivadas)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tipo, n]) => (
                    <li key={tipo} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
                      {TIPOS_NOTI.find((t) => t.id === tipo)?.nombre ?? tipo} · <b>{n}</b>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
