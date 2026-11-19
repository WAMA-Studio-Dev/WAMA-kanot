"use client";

import { useCallback, useEffect, useState } from "react";
import { Medal, Pencil, Plus, Trash2, Trophy } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { GRUPOS, colorGrupo, type Entrada } from "./secciones";
import { Aviso, Boton, Input, Modal, Select } from "./ui";

export type Resultado = { grupo: string; puesto: number; categoria?: string };
type ConResultados = Entrada & { resultados?: Resultado[] | null };

const GRUPOS_BAILE = GRUPOS.filter((g) => g.nombre !== "Todos juntos").map((g) => g.nombre);
const MEDALLA = ["", "🥇", "🥈", "🥉"];

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Temporada de una fecha: de septiembre a agosto ("26/27"). */
function temporada(fecha: string) {
  const [y, m] = fecha.split("-").map(Number);
  const ini = m >= 9 ? y : y - 1;
  return `${String(ini).slice(2)}/${String(ini + 1).slice(2)}`;
}

/** Resultados de un campeonato (en su tarjeta). Los apuntan editores y admins el mismo día o después. */
export default function ResultadosCompeticion({ entrada, onCambio }: { entrada: Entrada; onCambio?: () => void }) {
  const { esEditor } = useAuth();
  const [editar, setEditar] = useState(false);
  const resultados = ((entrada as ConResultados).resultados ?? []).slice().sort((a, b) => a.puesto - b.puesto);
  const yaEs = entrada.fecha ? entrada.fecha <= hoyISO() : false;
  if (!resultados.length && !(esEditor && yaEs)) return null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#ffd166]/30 bg-[#ffd166]/[0.07] p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Trophy size={16} className="text-[#ffd166]" /> Resultados
      </p>
      {resultados.length ? (
        <ul className="flex flex-col gap-1.5">
          {resultados.map((r, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-7 text-center text-lg leading-none">{MEDALLA[r.puesto] || <span className="text-xs font-bold text-white/60">{r.puesto}º</span>}</span>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorGrupo(r.grupo) }} />
              <b>{r.grupo}</b>
              {r.categoria && <span className="text-white/55">· {r.categoria}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/55">¿Cómo ha ido? Apunta los puestos de cada grupo.</p>
      )}
      {esEditor && (
        <button
          type="button"
          onClick={() => setEditar(true)}
          className="flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
        >
          <Pencil size={14} /> {resultados.length ? "Cambiar resultados" : "Añadir resultados"}
        </button>
      )}
      {editar && (
        <EditarResultados
          entrada={entrada}
          inicial={resultados}
          onCerrar={() => setEditar(false)}
          onGuardado={() => {
            setEditar(false);
            onCambio?.();
            window.dispatchEvent(new Event("kanot-resultados"));
          }}
        />
      )}
    </div>
  );
}

function EditarResultados({
  entrada,
  inicial,
  onCerrar,
  onGuardado,
}: {
  entrada: Entrada;
  inicial: Resultado[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [filas, setFilas] = useState<{ grupo: string; puesto: string; categoria: string }[]>(
    inicial.length
      ? inicial.map((r) => ({ grupo: r.grupo, puesto: String(r.puesto), categoria: r.categoria ?? "" }))
      : [{ grupo: GRUPOS_BAILE[0], puesto: "1", categoria: "" }],
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setGuardando(true);
    setError(null);
    const limpios = filas
      .filter((f) => f.grupo && Number(f.puesto) > 0)
      .map((f) => ({ grupo: f.grupo, puesto: Math.round(Number(f.puesto)), ...(f.categoria.trim() ? { categoria: f.categoria.trim() } : {}) }));
    const { error } = await getSupabase().from("entradas").update({ resultados: limpios }).eq("id", entrada.id);
    setGuardando(false);
    if (error) return setError(/resultados|schema cache/i.test(error.message) ? "Falta activar el SQL 025." : error.message);
    onGuardado();
  }

  const set = (i: number, k: "grupo" | "puesto" | "categoria", v: string) => setFilas(filas.map((f, j) => (j === i ? { ...f, [k]: v } : f)));

  return (
    <Modal titulo={`Resultados · ${entrada.titulo}`} onCerrar={onCerrar}>
      <div className="flex flex-col gap-3">
        {filas.map((f, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-2xl bg-white/5 p-3">
            <div className="flex gap-2">
              <Select value={f.grupo} onChange={(e) => set(i, "grupo", e.target.value)} className="flex-1 py-2 text-sm" aria-label="Grupo">
                {GRUPOS_BAILE.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                min={1}
                value={f.puesto}
                onChange={(e) => set(i, "puesto", e.target.value)}
                className="w-20 py-2 text-sm"
                aria-label="Puesto"
                placeholder="Puesto"
              />
              <button type="button" onClick={() => setFilas(filas.filter((_, j) => j !== i))} aria-label="Quitar" className="p-2 text-white/45 hover:text-white">
                <Trash2 size={16} />
              </button>
            </div>
            <Input value={f.categoria} onChange={(e) => set(i, "categoria", e.target.value)} placeholder="Categoría (opcional), p. ej. Infantil" className="py-2 text-sm" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFilas([...filas, { grupo: GRUPOS_BAILE[0], puesto: "", categoria: "" }])}
          className="flex w-fit items-center gap-1 text-xs font-semibold text-kanot-pink"
        >
          <Plus size={14} /> Añadir otro resultado
        </button>
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar resultados"}
        </Boton>
      </div>
    </Modal>
  );
}

/** Arriba de Competición: medallero de la temporada e historial de resultados. */
export function HistorialCompeticion() {
  const [lista, setLista] = useState<ConResultados[] | null>(null);
  const [verTodo, setVerTodo] = useState(false);

  const cargar = useCallback(async () => {
    const { data } = await getSupabase().from("entradas").select("*").eq("seccion", "competicion").order("fecha", { ascending: false });
    setLista(((data ?? []) as ConResultados[]).filter((e) => e.fecha && e.resultados?.length));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
    window.addEventListener("kanot-resultados", cargar);
    return () => window.removeEventListener("kanot-resultados", cargar);
  }, [cargar]);

  if (!lista?.length) return null;

  const actual = temporada(lista[0].fecha!);
  const deTemporada = lista.filter((e) => temporada(e.fecha!) === actual);
  const medallero = GRUPOS_BAILE.map((g) => {
    const r = deTemporada.flatMap((e) => e.resultados ?? []).filter((x) => x.grupo === g);
    return { grupo: g, oro: r.filter((x) => x.puesto === 1).length, plata: r.filter((x) => x.puesto === 2).length, bronce: r.filter((x) => x.puesto === 3).length, total: r.length };
  })
    .filter((m) => m.total)
    .sort((a, b) => b.oro - a.oro || b.plata - a.plata || b.bronce - a.bronce);
  const podios = medallero.reduce((n, m) => n + m.oro + m.plata + m.bronce, 0);

  return (
    <section className="mb-5 flex flex-col gap-3 rounded-3xl border border-[#ffd166]/30 bg-gradient-to-br from-[#ffd166]/[0.12] to-transparent p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffd166]">Temporada {actual}</p>
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Medal size={20} className="text-[#ffd166]" /> Medallero
          </h2>
        </div>
        <p className="text-right text-xs text-white/60">
          <b className="text-2xl font-black text-white">{podios}</b> podios
          <br />
          en {deTemporada.length} {deTemporada.length === 1 ? "campeonato" : "campeonatos"}
        </p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {medallero.map((m) => (
          <li key={m.grupo} className="flex items-center gap-3 rounded-2xl bg-black/20 px-3 py-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorGrupo(m.grupo) }} />
            <b className="flex-1">{m.grupo}</b>
            <span className="tabular-nums">🥇 {m.oro}</span>
            <span className="tabular-nums">🥈 {m.plata}</span>
            <span className="tabular-nums">🥉 {m.bronce}</span>
          </li>
        ))}
      </ul>

      <button type="button" onClick={() => setVerTodo((v) => !v)} className="self-start text-xs font-semibold text-white/60 hover:text-white">
        {verTodo ? "Ocultar historial" : `Ver historial (${lista.length})`}
      </button>
      {verTodo && (
        <ul className="flex flex-col gap-2">
          {lista.map((e) => (
            <li key={e.id} className="rounded-2xl bg-black/20 p-3 text-sm">
              <p className="font-bold">
                {e.titulo}{" "}
                <span className="text-xs font-normal text-white/45">
                  · {new Date(e.fecha!).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </p>
              <p className="mt-1 text-xs text-white/75">
                {(e.resultados ?? [])
                  .slice()
                  .sort((a, b) => a.puesto - b.puesto)
                  .map((r) => `${MEDALLA[r.puesto] || `${r.puesto}º`} ${r.grupo}${r.categoria ? ` (${r.categoria})` : ""}`)
                  .join("  ·  ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
