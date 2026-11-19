"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Lightbulb, Mic, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { Aviso, Boton, Input, Modal, Textarea } from "./ui";

type Propuesta = { id: string; nombre_autor: string | null; invitado: string; motivo: string | null; created_at: string };

/** Podcast: cualquiera propone a quién entrevistar; editores y admins ven las propuestas. */
export default function PropuestasPodcast() {
  const { perfil, esEditor } = useAuth();
  const [invitado, setInvitado] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lista, setLista] = useState<Propuesta[]>([]);
  const [ver, setVer] = useState(false);

  const cargar = useCallback(async () => {
    if (!esEditor) return;
    const { data } = await getSupabase().from("propuestas_podcast").select("*").order("created_at", { ascending: false });
    setLista((data ?? []) as Propuesta[]);
  }, [esEditor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await getSupabase()
      .from("propuestas_podcast")
      .insert({ invitado: invitado.trim(), motivo: motivo.trim() || null, nombre_autor: perfil?.nombre ?? perfil?.email ?? null });
    setEnviando(false);
    if (error) return setError(/propuestas_podcast|schema cache/i.test(error.message) ? "Falta activar el SQL 025." : error.message);
    setInvitado("");
    setMotivo("");
    setEnviada(true);
    cargar();
  }

  async function borrar(p: Propuesta) {
    if (!confirm(`¿Borrar la propuesta de ${p.invitado}?`)) return;
    await getSupabase().from("propuestas_podcast").delete().eq("id", p.id);
    cargar();
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-kanot-pink/25 bg-kanot-pink/[0.07] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black">
            <Lightbulb size={20} className="text-kanot-pink" /> ¿A quién entrevistamos?
          </h2>
          <p className="text-sm text-white/60">Propón un bailarín, coreógrafo o artista para el próximo episodio.</p>
        </div>
        {esEditor && (
          <button
            type="button"
            onClick={() => setVer(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
          >
            <Mic size={14} /> Propuestas ({lista.length})
          </button>
        )}
      </div>

      {enviada ? (
        <Aviso tipo="ok">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} /> ¡Gracias! Le pasamos tu propuesta al equipo del podcast.
          </span>
        </Aviso>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-2">
          <Input value={invitado} onChange={(e) => setInvitado(e.target.value)} placeholder="Nombre o @instagram" required maxLength={80} />
          <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="¿Por qué? (opcional)" rows={2} maxLength={300} />
          {error && <Aviso>{error}</Aviso>}
          <Boton type="submit" disabled={enviando || !invitado.trim()}>
            {enviando ? "Enviando…" : "Enviar propuesta"}
          </Boton>
        </form>
      )}
      {enviada && (
        <button type="button" onClick={() => setEnviada(false)} className="self-start text-xs font-semibold text-white/60 hover:text-white">
          Proponer a otra persona
        </button>
      )}

      {ver && (
        <Modal titulo="Propuestas para el podcast" onCerrar={() => setVer(false)}>
          {lista.length ? (
            <ul className="flex flex-col gap-2">
              {lista.map((p) => (
                <li key={p.id} className="rounded-2xl bg-white/5 p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <b>{p.invitado}</b>
                    <button type="button" onClick={() => borrar(p)} aria-label="Borrar" className="p-1 text-white/45 hover:text-white">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {p.motivo && <p className="mt-1 text-white/75">{p.motivo}</p>}
                  <p className="mt-1.5 text-[11px] text-white/40">
                    {p.nombre_autor ?? "Alguien"} · {new Date(p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/60">Todavía no hay propuestas.</p>
          )}
        </Modal>
      )}
    </section>
  );
}
