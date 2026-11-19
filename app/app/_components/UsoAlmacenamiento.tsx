"use client";

import { useEffect, useState } from "react";
import { Database, HardDrive } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";

/** Límites del plan gratuito de Supabase. */
const LIMITE_ARCHIVOS = 1024 ** 3; // 1 GB
const LIMITE_BD = 500 * 1024 ** 2; // 500 MB

const NOMBRES: Record<string, string> = {
  crew: "Galería de Kanot Crew",
  archivos: "Gestor de archivos",
  autorizaciones: "Autorizaciones",
  documentos: "Documentos de campeonatos",
  portfolio: "Portfolio de Fotografía",
  avatares: "Fotos de perfil",
};

type Fila = { bucket: string; archivos: number; bytes: number };

function tamano(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.max(0, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(bytes < 10 * 1024 ** 2 ? 1 : 0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function Barra({ usado, limite }: { usado: number; limite: number }) {
  const pct = Math.min(100, (usado / limite) * 100);
  const color = pct > 85 ? "bg-red-400" : pct > 60 ? "bg-amber-300" : "bg-kanot-pink";
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 1)}%` }} />
    </div>
  );
}

/** Perfil (solo admins): cuánto espacio queda en el plan gratis de Supabase. */
export default function UsoAlmacenamiento() {
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabase()
      .rpc("uso_almacenamiento")
      .then(({ data, error }) => {
        if (error) setError(/uso_almacenamiento|schema cache/i.test(error.message) ? "Falta activar el SQL 011." : error.message);
        else setFilas(((data ?? []) as Fila[]).map((f) => ({ ...f, bytes: Number(f.bytes), archivos: Number(f.archivos) })));
      });
  }, []);

  const bd = filas?.find((f) => f.bucket === "__base_de_datos__")?.bytes ?? 0;
  const carpetas = (filas ?? []).filter((f) => f.bucket !== "__base_de_datos__").sort((a, b) => b.bytes - a.bytes);
  const totalArchivos = carpetas.reduce((n, f) => n + f.bytes, 0);
  const quedan = Math.max(0, LIMITE_ARCHIVOS - totalArchivos);

  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">Almacenamiento</h2>
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/25 p-4">
        {error && <p className="text-sm text-white/60">{error}</p>}
        {!filas && !error && <p className="text-sm text-white/50">Calculando…</p>}
        {filas && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <HardDrive size={16} className="text-kanot-pink" /> Archivos
                </span>
                <span className="text-white/70">
                  {tamano(totalArchivos)} de 1 GB · <b className="text-white">quedan {tamano(quedan)}</b>
                </span>
              </div>
              <Barra usado={totalArchivos} limite={LIMITE_ARCHIVOS} />
              {carpetas.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1 text-xs text-white/60">
                  {carpetas.map((c) => (
                    <li key={c.bucket} className="flex justify-between gap-3">
                      <span>
                        {NOMBRES[c.bucket] ?? c.bucket} <span className="text-white/35">· {c.archivos}</span>
                      </span>
                      <span>{tamano(c.bytes)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <Database size={16} className="text-kanot-pink" /> Base de datos
                </span>
                <span className="text-white/70">
                  {tamano(bd)} de 500 MB
                </span>
              </div>
              <Barra usado={bd} limite={LIMITE_BD} />
            </div>

            <p className="text-[11px] leading-relaxed text-white/40">
              Plan gratis de Supabase. Lo que más ocupa son los vídeos: si os acercáis al límite, guardad los vídeos
              largos en el Drive o pasad al plan Pro. Las descargas (5 GB al mes) se miran en Supabase → Usage.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
