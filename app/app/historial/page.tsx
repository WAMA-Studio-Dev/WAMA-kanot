"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "../_components/AuthProvider";
import { Aviso, Cargando, Input } from "../_components/ui";

type Cambio = {
  id: number;
  created_at: string;
  quien: string | null;
  accion: "crear" | "cambiar" | "borrar";
  tabla: string;
  seccion: string | null;
  que: string | null;
  detalle: string | null;
};

const SECCION: Record<string, string> = {
  horarios: "Ensayo",
  competicion: "Campeonato",
  formaciones: "Formación",
  avisos: "Aviso",
  "avisos-crew": "Aviso (crew)",
  "kodigo-klub": "Kodigo Klub",
  "kanot-kamp": "Kanot Kamp",
  "kanot-kamp-info": "Kanot Kamp",
  "kanot-kamp-profes": "Profesor Kamp",
  podcast: "Podcast",
  agencia: "Agencia",
  fotografia: "Fotografía",
};
const TABLA: Record<string, string> = {
  documentos_competicion: "Documento",
  autorizaciones: "Autorización",
  crew_media: "Foto / vídeo",
  inscripciones: "Inscripción",
  bailarines: "Bailarín",
  cuenta_bailarines: "Bailarín asignado",
  pedidos_merch: "Pedido de merch",
  merch_precios: "Precio de merch",
  agencia_bailarines: "Ficha de agencia",
  apuntados_formacion: "Apuntado a formación",
  solicitudes_familia: "Solicitud de familia",
  profiles: "Cuenta",
};
const tipo = (c: Cambio) => (c.tabla === "entradas" ? SECCION[c.seccion ?? ""] ?? "Contenido" : TABLA[c.tabla] ?? c.tabla);

const ACCION = {
  crear: { texto: "ha añadido", icono: Plus, clase: "bg-emerald-500/15 text-emerald-300" },
  cambiar: { texto: "ha cambiado", icono: Pencil, clase: "bg-kanot-electric/15 text-kanot-electric" },
  borrar: { texto: "ha borrado", icono: Trash2, clase: "bg-red-500/15 text-red-200" },
} as const;

const normalizar = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function dia(iso: string) {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return "Hoy";
  if (d.toDateString() === ayer.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

/** Historial de cambios (solo admins): quién ha subido, cambiado o borrado algo y cuándo. */
export default function PaginaHistorial() {
  const { esAdmin } = useAuth();
  const [cambios, setCambios] = useState<Cambio[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todo" | "borrar">("todo");

  const cargar = useCallback(async () => {
    const { data, error } = await getSupabase().from("historial_cambios").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) setError(/historial_cambios|schema cache/i.test(error.message) ? "Falta activar el SQL 026." : error.message);
    setCambios((data ?? []) as Cambio[]);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    if (esAdmin) cargar();
  }, [cargar, esAdmin]);

  const q = normalizar(busca.trim());
  const visibles = useMemo(
    () =>
      (cambios ?? []).filter(
        (c) =>
          (filtro === "todo" || c.accion === filtro) &&
          (!q || [c.quien, c.que, c.detalle, tipo(c)].some((v) => v && normalizar(v).includes(q))),
      ),
    [cambios, filtro, q],
  );

  if (!esAdmin) return <Aviso>Esta sección es solo para administradores.</Aviso>;

  // Agrupado por día.
  const grupos: { dia: string; items: Cambio[] }[] = [];
  for (const c of visibles) {
    const d = dia(c.created_at);
    if (grupos.at(-1)?.dia !== d) grupos.push({ dia: d, items: [] });
    grupos.at(-1)!.items.push(c);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
          <History size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Historial de cambios</h1>
          <p className="text-sm text-white/55">Quién ha subido, cambiado o borrado algo</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por persona o por lo que sea" className="pl-9" />
      </div>
      <div className="flex gap-2">
        {(
          [
            ["todo", "Todo"],
            ["borrar", "Solo lo borrado"],
          ] as const
        ).map(([v, n]) => (
          <button
            key={v}
            type="button"
            onClick={() => setFiltro(v)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filtro === v ? "bg-kanot-pink text-kanot-navy-deep" : "bg-white/10 text-white/75 hover:bg-white/15"}`}
          >
            {n}
          </button>
        ))}
      </div>

      {error && <Aviso>{error}</Aviso>}
      {!cambios && !error && <Cargando />}
      {cambios && !visibles.length && !error && (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
          {cambios.length ? "No hay nada con ese filtro." : "Todavía no hay cambios apuntados. Empieza a contar desde ahora."}
        </p>
      )}

      {grupos.map((g) => (
        <section key={g.dia}>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">{g.dia}</h2>
          <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
            {g.items.map((c) => {
              const a = ACCION[c.accion];
              return (
                <li key={c.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${a.clase}`}>
                    <a.icono size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block">
                      <b>{c.quien ?? "Alguien"}</b> <span className="text-white/60">{a.texto}</span> {tipo(c).toLowerCase()}
                      {c.que && <b className="text-white/90">: {c.que}</b>}
                    </span>
                    {c.detalle && <span className="block text-xs text-white/55">{c.detalle}</span>}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-white/40">
                    {new Date(c.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-center text-[11px] text-white/40">Se guardan los cambios del último año. Lo apunta la base de datos sola.</p>
    </div>
  );
}
