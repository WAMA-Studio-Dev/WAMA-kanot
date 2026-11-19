"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/app/lib/supabase/client";
import type { Perfil } from "./secciones";
import type { Bailarin } from "./AsignarBailarines";
import { Boton, Select } from "./ui";

type Solicitud = { id: string; user_id: string; hijo_nombre: string; bailarin_id: string | null; created_at: string };

const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/** El bailarín de la lista que más se parece al nombre escrito por la familia. */
function sugerir(nombre: string, bailarines: Bailarin[]) {
  const palabras = normalizar(nombre).split(/\s+/).filter((p) => p.length > 1);
  let mejor: Bailarin | null = null;
  let puntos = 0;
  for (const b of bailarines) {
    const n = normalizar(b.nombre);
    const p = palabras.filter((w) => n.includes(w)).length;
    if (p > puntos) {
      puntos = p;
      mejor = b;
    }
  }
  return mejor?.id ?? "";
}

/** Usuarios (admins): solicitudes de madres/padres para vincular a su hijo/a. */
export default function SolicitudesFamilia({ perfiles, onCambio }: { perfiles: Perfil[]; onCambio: () => void }) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [bailarines, setBailarines] = useState<Bailarin[]>([]);
  const [eleccion, setEleccion] = useState<Record<string, string>>({});
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const supabase = getSupabase();
    const [s, b] = await Promise.all([
      supabase.from("solicitudes_familia").select("*").eq("estado", "pendiente").order("created_at"),
      supabase.from("bailarines").select("id, nombre, grupos").order("nombre"),
    ]);
    const lista = (s.data ?? []) as Solicitud[];
    const todos = (b.data ?? []) as Bailarin[];
    setSolicitudes(lista);
    setBailarines(todos);
    setEleccion(Object.fromEntries(lista.map((x) => [x.id, x.bailarin_id ?? sugerir(x.hijo_nombre, todos)])));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  if (!solicitudes.length) return null;

  async function aprobar(s: Solicitud) {
    const bailarin = eleccion[s.id];
    if (!bailarin) return setError("Elige el bailarín de la lista antes de aprobar.");
    setTrabajando(s.id);
    setError(null);
    const { error } = await getSupabase().rpc("aprobar_solicitud_familia", { p_solicitud: s.id, p_bailarin: bailarin });
    setTrabajando(null);
    if (error) return setError(error.message);
    cargar();
    onCambio();
  }

  async function rechazar(s: Solicitud) {
    if (!confirm(`¿Rechazar la solicitud para vincular a ${s.hijo_nombre}?`)) return;
    setTrabajando(s.id);
    await getSupabase().rpc("rechazar_solicitud_familia", { p_solicitud: s.id });
    setTrabajando(null);
    cargar();
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-kanot-pink">
        Solicitudes de familia ({solicitudes.length})
      </h2>
      <ul className="flex flex-col gap-3">
        {solicitudes.map((s) => {
          const quien = perfiles.find((p) => p.id === s.user_id);
          return (
            <li key={s.id} className="flex flex-col gap-3 rounded-3xl border border-kanot-pink/30 bg-kanot-pink/[0.07] p-4">
              <p className="text-sm">
                <b>{quien?.nombre ?? quien?.email ?? "Alguien"}</b>
                <span className="text-white/55"> ({quien?.email})</span> dice que es madre, padre o tutor/a de{" "}
                <b>{s.hijo_nombre}</b>.
              </p>
              <Select
                value={eleccion[s.id] ?? ""}
                onChange={(e) => setEleccion({ ...eleccion, [s.id]: e.target.value })}
                className="py-2 text-sm"
                aria-label="Bailarín a vincular"
              >
                <option value="">Elige el bailarín de la lista…</option>
                {bailarines.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} · {b.grupos.join(" + ")}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Boton variante="secundario" onClick={() => rechazar(s)} disabled={trabajando === s.id} className="flex-1 py-2">
                  Rechazar
                </Boton>
                <Boton onClick={() => aprobar(s)} disabled={trabajando === s.id || !eleccion[s.id]} className="flex-1 py-2">
                  Aprobar
                </Boton>
              </div>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
    </section>
  );
}
