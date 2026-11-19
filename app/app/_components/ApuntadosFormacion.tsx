"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Trash2, Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { Modal } from "./ui";

type Apuntado = { id: string; user_id: string; nombre: string | null; instagram: string | null; created_at: string };

/** Guarda en la app que alguien se ha apuntado a una formación (además del WhatsApp). */
export async function guardarApuntado(formacionId: string, datos: { nombre: string; instagram: string }) {
  const { error } = await getSupabase()
    .from("apuntados_formacion")
    .insert({ formacion_id: formacionId, nombre: datos.nombre || null, instagram: datos.instagram || null });
  if (error) console.error("No se pudo guardar la inscripción:", error.message);
  window.dispatchEvent(new Event("kanot-apuntados"));
}

/** Debajo de cada formación: "Ya te has apuntado" y, para editores/admins, la lista de apuntados. */
export default function ApuntadosFormacion({ formacionId, titulo }: { formacionId: string; titulo: string }) {
  const { esEditor, perfil } = useAuth();
  const [lista, setLista] = useState<Apuntado[]>([]);
  const [ver, setVer] = useState(false);

  const cargar = useCallback(async () => {
    const { data } = await getSupabase()
      .from("apuntados_formacion")
      .select("id, user_id, nombre, instagram, created_at")
      .eq("formacion_id", formacionId)
      .order("created_at");
    setLista((data ?? []) as Apuntado[]);
  }, [formacionId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
    window.addEventListener("kanot-apuntados", cargar);
    return () => window.removeEventListener("kanot-apuntados", cargar);
  }, [cargar]);

  async function borrar(a: Apuntado) {
    if (!confirm(`¿Quitar a ${a.nombre ?? "esta persona"} de la lista?`)) return;
    await getSupabase().from("apuntados_formacion").delete().eq("id", a.id);
    cargar();
  }

  const yo = lista.some((a) => a.user_id === perfil?.id);
  if (!yo && !esEditor) return null;

  return (
    <div className="-mt-2 flex flex-wrap items-center gap-2 px-1">
      {yo && (
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
          <CheckCircle2 size={14} /> Te has apuntado
        </span>
      )}
      {esEditor && (
        <button
          type="button"
          onClick={() => setVer(true)}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/15"
        >
          <Users size={14} /> Apuntados ({lista.length})
        </button>
      )}
      {ver && (
        <Modal titulo={`Apuntados · ${titulo}`} onCerrar={() => setVer(false)}>
          {lista.length ? (
            <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
              {lista.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="w-6 text-xs text-white/40 tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{a.nombre ?? "Sin nombre"}</span>
                    <span className="block text-xs text-white/45">
                      {a.instagram ? `@${a.instagram} · ` : ""}
                      {new Date(a.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </span>
                  </span>
                  <button type="button" onClick={() => borrar(a)} aria-label="Quitar" className="p-1 text-white/45 hover:text-white">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/60">Todavía nadie se ha apuntado desde la app.</p>
          )}
          <p className="mt-3 text-[11px] text-white/40">
            Son los que se han apuntado desde la app. El DNI no se guarda aquí: solo va en el WhatsApp.
          </p>
        </Modal>
      )}
    </div>
  );
}
