"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import type { Perfil } from "./secciones";
import { Aviso, Boton, Input, Modal } from "./ui";

export type Bailarin = { id: string; nombre: string; grupos: string[] };

/** Admin: elige qué bailarines (de la lista del Excel) son de esta cuenta. */
export default function AsignarBailarines({
  perfil,
  onCerrar,
  onGuardado,
}: {
  perfil: Perfil;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [todos, setTodos] = useState<Bailarin[] | null>(null);
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());
  const [iniciales, setIniciales] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    Promise.all([
      supabase.from("bailarines").select("id, nombre, grupos").order("nombre"),
      supabase.from("cuenta_bailarines").select("bailarin_id").eq("user_id", perfil.id),
    ]).then(([b, c]) => {
      if (b.error) {
        setError(/bailarines|schema cache/i.test(b.error.message) ? "Falta activar las inscripciones (SQL 013 y 014)." : b.error.message);
        setTodos([]);
        return;
      }
      setTodos((b.data ?? []) as Bailarin[]);
      const ya = new Set((c.data ?? []).map((x) => x.bailarin_id as string));
      setElegidos(ya);
      setIniciales(new Set(ya));
    });
  }, [perfil.id]);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (!t) return todos ?? [];
    return (todos ?? []).filter((b) =>
      b.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(t),
    );
  }, [todos, busca]);

  function alternar(id: string) {
    setElegidos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    const supabase = getSupabase();
    const anadir = [...elegidos].filter((id) => !iniciales.has(id));
    const quitar = [...iniciales].filter((id) => !elegidos.has(id));
    if (anadir.length) {
      const { error } = await supabase
        .from("cuenta_bailarines")
        .insert(anadir.map((bailarin_id) => ({ user_id: perfil.id, bailarin_id })));
      if (error) return (setError(error.message), setGuardando(false));
    }
    if (quitar.length) {
      const { error } = await supabase
        .from("cuenta_bailarines")
        .delete()
        .eq("user_id", perfil.id)
        .in("bailarin_id", quitar);
      if (error) return (setError(error.message), setGuardando(false));
    }
    onGuardado();
  }

  return (
    <Modal titulo={`Bailarines de ${perfil.nombre ?? perfil.email}`} onCerrar={onCerrar}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-white/60">Marca los bailarines de esta cuenta (una familia puede tener varios).</p>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nombre" className="pl-9" />
        </div>
        {!todos && <p className="text-sm text-white/50">Cargando…</p>}
        {todos && (
          <ul className="max-h-[45dvh] divide-y divide-white/5 overflow-y-auto rounded-2xl bg-white/5">
            {filtrados.map((b) => (
              <li key={b.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={elegidos.has(b.id)}
                    onChange={() => alternar(b.id)}
                    className="h-4 w-4 accent-kanot-pink"
                  />
                  <span className="flex-1">{b.nombre}</span>
                  <span className="text-xs text-white/45">{b.grupos.join(" + ")}</span>
                </label>
              </li>
            ))}
            {!filtrados.length && <li className="px-3 py-4 text-sm text-white/50">No hay nadie con ese nombre.</li>}
          </ul>
        )}
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={guardar} disabled={guardando || !todos}>
          {guardando ? "Guardando…" : `Guardar (${elegidos.size})`}
        </Boton>
      </div>
    </Modal>
  );
}
