"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Megaphone, Pin, PinOff, Plus, Trash2 } from "lucide-react";
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
  const [avisos, setAvisos] = useState<(Entrada & { created_at: string; fijado?: boolean | null })[] | null>(null);
  const [verTodos, setVerTodos] = useState(false);
  const [nuevo, setNuevo] = useState(false);

  const cargar = useCallback(async () => {
    const { data } = await getSupabase()
      .from("entradas")
      .select("*")
      .in("seccion", esCrew ? ["avisos", "avisos-crew"] : ["avisos"])
      .order("created_at", { ascending: false })
      .limit(20);
    // Los fijados siempre arriba.
    const lista = (data ?? []) as (Entrada & { created_at: string; fijado?: boolean | null })[];
    setAvisos([...lista].sort((a, b) => Number(!!b.fijado) - Number(!!a.fijado)));
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

  async function fijar(id: string, valor: boolean) {
    const { error } = await getSupabase().from("entradas").update({ fijado: valor }).eq("id", id);
    if (error) alert(/fijado|schema cache/i.test(error.message) ? "Falta activar el SQL 024 para fijar avisos." : error.message);
    cargar();
  }

  if (!avisos || (avisos.length === 0 && !esEditor)) return null;
  const fijados = avisos.filter((a) => a.fijado);
  const resto = avisos.filter((a) => !a.fijado);
  const visibles = verTodos ? avisos : [...fijados, ...resto.slice(0, Math.max(0, MAX_VISIBLES - fijados.length))];

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
            <li
              key={a.id}
              className={`rounded-2xl border-l-4 p-4 ${a.fijado ? "border-kanot-pink bg-kanot-pink/[0.12] ring-1 ring-kanot-pink/30" : "border-kanot-pink bg-white/[0.05]"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold leading-snug">
                  {a.fijado && <Pin size={14} className="mr-1.5 inline -translate-y-px text-kanot-pink" />}
                  {a.titulo}
                </p>
                {esEditor && (
                  <span className="flex shrink-0">
                    <button
                      type="button"
                      onClick={() => fijar(a.id, !a.fijado)}
                      aria-label={a.fijado ? "Quitar de arriba" : "Fijar arriba"}
                      title={a.fijado ? "Quitar de arriba" : "Fijar arriba"}
                      className={`p-1 hover:text-white ${a.fijado ? "text-kanot-pink" : "text-white/40"}`}
                    >
                      {a.fijado ? <PinOff size={15} /> : <Pin size={15} />}
                    </button>
                    <button type="button" onClick={() => borrar(a.id)} aria-label="Borrar" className="p-1 text-white/40 hover:text-white">
                      <Trash2 size={15} />
                    </button>
                  </span>
                )}
              </div>
              {a.descripcion && <p className="mt-1 whitespace-pre-line text-sm text-white/75">{a.descripcion}</p>}
              <p className="mt-2 text-[11px] text-white/40">
                {hace(a.created_at)}
                {a.seccion === "avisos-crew" && " · Solo Kanot Crew"}
                {a.fijado && " · Fijado arriba"}
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

/** Avisos que se repiten, listos para publicar (se pueden cambiar antes). */
const PLANTILLAS: { nombre: string; titulo: string; texto: string; destino: "todos" | "crew" }[] = [
  { nombre: "No hay ensayo", titulo: "Mañana no hay ensayo", texto: "Descansad y nos vemos en el próximo. 💗", destino: "crew" },
  { nombre: "Cambio de hora", titulo: "Cambio de hora del ensayo", texto: "El ensayo de [grupo] pasa a ser de [hora] a [hora].", destino: "crew" },
  { nombre: "Cambio de sitio", titulo: "Cambio de lugar del ensayo", texto: "Esta vez ensayamos en [lugar]. Misma hora.", destino: "crew" },
  { nombre: "Autorización", titulo: "Recordad la autorización", texto: "Quien no la haya subido: descargadla en Competición, firmadla y subidla en la app.", destino: "crew" },
  { nombre: "Pago", titulo: "Recordatorio de pago", texto: "Quedan pagos pendientes de la inscripción de [campeonato]. Mirad el importe en la app.", destino: "crew" },
  { nombre: "Vestuario", titulo: "Vestuario para [campeonato]", texto: "Traed: [ropa]. Pelo [peinado]. ¡Revisadlo antes de salir de casa!", destino: "crew" },
  { nombre: "Fotos subidas", titulo: "¡Ya están las fotos!", texto: "Tenéis las fotos de [evento] en Kanot Crew → Archivos.", destino: "crew" },
  { nombre: "Entradas Kodigo", titulo: "Entradas de Kodigo a la venta", texto: "Ya podéis comprar las entradas de la próxima edición en la app.", destino: "todos" },
];

function NuevoAviso({ onCerrar, onPublicado }: { onCerrar: () => void; onPublicado: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [destino, setDestino] = useState<"todos" | "crew">("todos");
  const [notificar, setNotificar] = useState(true);
  const [fijado, setFijado] = useState(false);
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
        ...(fijado ? { fijado: true } : {}),
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
          <div>
            <p className="mb-1.5 text-xs font-semibold text-white/60">Empezar desde una plantilla</p>
            <div className="-mx-1 flex flex-wrap gap-1.5">
              {PLANTILLAS.map((p) => (
                <button
                  key={p.nombre}
                  type="button"
                  onClick={() => {
                    setTitulo(p.titulo);
                    setTexto(p.texto);
                    setDestino(p.destino);
                  }}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-kanot-pink/25 hover:text-kanot-pink"
                >
                  {p.nombre}
                </button>
              ))}
            </div>
            {/\[[^\]]+\]/.test(`${titulo} ${texto}`) && (
              <p className="mt-2 text-[11px] text-amber-200">Cambia lo que está entre [corchetes] antes de publicar.</p>
            )}
          </div>
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
          <label className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm">
            <input type="checkbox" checked={fijado} onChange={(e) => setFijado(e.target.checked)} className="h-4 w-4 accent-kanot-pink" />
            <Pin size={15} className="text-kanot-pink" /> Fijar arriba hasta que lo quite
          </label>
          {error && <Aviso>{error}</Aviso>}
          <Boton type="submit" disabled={enviando || /\[[^\]]+\]/.test(`${titulo} ${texto}`)}>
            {enviando ? "Publicando…" : "Publicar aviso"}
          </Boton>
        </form>
      )}
    </Modal>
  );
}
