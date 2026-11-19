"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import type { Entrada } from "./secciones";
import { enviarNotificacion } from "./notificaciones";
import { Aviso, Boton, Etiqueta, Input, Modal, Select, Textarea } from "./ui";

const MAX_VISIBLES = 3;

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hace(iso: string) {
  const dias = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/** Tablón de avisos de Inicio. Lo publican editores y admins; pueden mandar notificación. */
export default function Tablon() {
  const { esEditor, esCrew } = useAuth();
  const [avisos, setAvisos] = useState<(Entrada & { created_at: string })[] | null>(null);
  const [verTodos, setVerTodos] = useState(false);
  const [nuevo, setNuevo] = useState(false);

  const cargar = useCallback(async () => {
    const { data } = await getSupabase()
      .from("entradas")
      .select("*")
      .in("seccion", esCrew ? ["avisos", "avisos-crew"] : ["avisos"])
      .order("created_at", { ascending: false })
      .limit(20);
    setAvisos((data ?? []) as (Entrada & { created_at: string })[]);
  }, [esCrew]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function borrar(id: string) {
    if (!confirm("¿Borrar este aviso?")) return;
    await getSupabase().from("entradas").delete().eq("id", id);
    cargar();
  }

  if (!avisos || (avisos.length === 0 && !esEditor)) return null;
  const visibles = verTodos ? avisos : avisos.slice(0, MAX_VISIBLES);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <Megaphone size={22} className="text-kanot-pink" /> Avisos
        </h2>
        {esEditor && (
          <Boton onClick={() => setNuevo(true)} className="px-4 py-2">
            <Plus size={16} /> Nuevo
          </Boton>
        )}
      </div>

      {avisos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm text-white/55">
          Todavía no hay avisos. Publica el primero con “Nuevo”.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibles.map((a) => (
            <li key={a.id} className="rounded-2xl border-l-4 border-kanot-pink bg-white/[0.05] p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold leading-snug">{a.titulo}</p>
                {esEditor && (
                  <button type="button" onClick={() => borrar(a.id)} aria-label="Borrar" className="p-1 text-white/40 hover:text-white">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              {a.descripcion && <p className="mt-1 whitespace-pre-line text-sm text-white/75">{a.descripcion}</p>}
              <p className="mt-2 text-[11px] text-white/40">
                {hace(a.created_at)}
                {a.seccion === "avisos-crew" && " · Solo Kanot Crew"}
              </p>
            </li>
          ))}
        </ul>
      )}

      {avisos.length > MAX_VISIBLES && (
        <button type="button" onClick={() => setVerTodos((v) => !v)} className="self-start text-sm font-semibold text-white/60 hover:text-kanot-pink">
          {verTodos ? "Ver menos" : `Ver todos (${avisos.length})`}
        </button>
      )}

      {nuevo && (
        <NuevoAviso
          onCerrar={() => setNuevo(false)}
          onPublicado={() => {
            setNuevo(false);
            cargar();
          }}
        />
      )}
    </section>
  );
}

function NuevoAviso({ onCerrar, onPublicado }: { onCerrar: () => void; onPublicado: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [destino, setDestino] = useState<"todos" | "crew">("todos");
  const [notificar, setNotificar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  async function publicar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await getSupabase()
      .from("entradas")
      .insert({
        seccion: destino === "crew" ? "avisos-crew" : "avisos",
        titulo: titulo.trim(),
        descripcion: texto.trim() || null,
        fecha: hoyISO(),
      });
    if (error) {
      setError(error.message);
      setEnviando(false);
      return;
    }
    if (notificar) {
      try {
        const r = await enviarNotificacion({ titulo: titulo.trim(), cuerpo: texto.trim(), url: "/app", destino, tipo: "avisos" });
        setResultado(`Aviso publicado y enviado a ${r.enviadas} ${r.enviadas === 1 ? "móvil" : "móviles"}.`);
        setEnviando(false);
        setTimeout(onPublicado, 1500);
        return;
      } catch (err) {
        setResultado(`Aviso publicado, pero no se pudo notificar: ${err instanceof Error ? err.message : err}`);
        setEnviando(false);
        return;
      }
    }
    onPublicado();
  }

  return (
    <Modal titulo="Nuevo aviso" onCerrar={resultado ? onPublicado : onCerrar}>
      {resultado ? (
        <div className="flex flex-col gap-4">
          <Aviso tipo="ok">{resultado}</Aviso>
          <Boton onClick={onPublicado}>Cerrar</Boton>
        </div>
      ) : (
        <form onSubmit={publicar} className="flex flex-col gap-4">
          <Etiqueta texto="Título">
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required maxLength={80} autoFocus placeholder="Mañana no hay ensayo" />
          </Etiqueta>
          <Etiqueta texto="Texto (opcional)">
            <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} rows={3} />
          </Etiqueta>
          <Etiqueta texto="Para">
            <Select value={destino} onChange={(e) => setDestino(e.target.value as "todos" | "crew")}>
              <option value="todos">Todos</option>
              <option value="crew">Solo Kanot Crew</option>
            </Select>
          </Etiqueta>
          <label className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm">
            <input type="checkbox" checked={notificar} onChange={(e) => setNotificar(e.target.checked)} className="h-4 w-4 accent-kanot-pink" />
            Enviar también una notificación al móvil
          </label>
          {error && <Aviso>{error}</Aviso>}
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Publicando…" : "Publicar aviso"}
          </Boton>
        </form>
      )}
    </Modal>
  );
}
