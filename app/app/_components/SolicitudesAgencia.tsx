"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Phone, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { Aviso, Cargando } from "./ui";

type Solicitud = { id: string; nombre: string; email: string; telefono: string | null; mensaje: string | null; created_at: string };

/** Agencia: lo que llega por el formulario de contacto (web y app), guardado como lista. */
export default function SolicitudesAgencia() {
  const [lista, setLista] = useState<Solicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await getSupabase().from("solicitudes_agencia").select("*").order("created_at", { ascending: false });
    if (error) setError(/solicitudes_agencia|schema cache/i.test(error.message) ? "Falta activar el SQL 025." : error.message);
    setLista((data ?? []) as Solicitud[]);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function borrar(s: Solicitud) {
    if (!confirm(`¿Borrar la solicitud de ${s.nombre}?`)) return;
    await getSupabase().from("solicitudes_agencia").delete().eq("id", s.id);
    cargar();
  }

  if (!lista) return <Cargando />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-white/60">
        Lo que escriben en el formulario de Agencia (web y app). También os llega por correo.
      </p>
      {error && <Aviso>{error}</Aviso>}
      {!lista.length && !error && (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">Todavía no hay solicitudes.</p>
      )}
      {lista.map((s) => (
        <article key={s.id} className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-black/25 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold">{s.nombre}</p>
              <p className="text-[11px] text-white/45">
                {new Date(s.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <button type="button" onClick={() => borrar(s)} aria-label="Borrar" className="p-1 text-white/45 hover:text-white">
              <Trash2 size={15} />
            </button>
          </div>
          {s.mensaje && <p className="whitespace-pre-line text-sm text-white/80">{s.mensaje}</p>}
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15">
              <Mail size={13} /> {s.email}
            </a>
            {s.telefono && (
              <a href={`tel:${s.telefono}`} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15">
                <Phone size={13} /> {s.telefono}
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
