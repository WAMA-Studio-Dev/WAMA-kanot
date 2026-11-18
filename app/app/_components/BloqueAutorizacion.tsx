"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Download, Eye, FileText, Trash2, Upload, Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { GRUPOS, type Entrada } from "./secciones";
import { Aviso, Boton, Etiqueta, Input, Modal, Select } from "./ui";

type Autorizacion = {
  id: string;
  entrada_id: string;
  user_id: string;
  subido_por: string | null;
  bailarin: string;
  grupo: string | null;
  archivo_path: string;
  created_at: string;
};

const GRUPOS_BAILE = GRUPOS.filter((g) => g.nombre !== "Todos juntos").map((g) => g.nombre);

function limpiar(nombre: string) {
  return nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
}

async function abrirArchivo(bucket: string, ruta: string) {
  const ventana = window.open("", "_blank");
  const { data, error } = await getSupabase().storage.from(bucket).createSignedUrl(ruta, 600);
  if (error || !data) {
    ventana?.close();
    alert(error?.message ?? "No se pudo abrir el archivo");
    return;
  }
  if (ventana) ventana.location.href = data.signedUrl;
  else window.location.assign(data.signedUrl);
}

/** Autorizaciones de un campeonato: descargar, subir firmada y (editores) ver entregas. */
export default function BloqueAutorizacion({ entrada, onCambio }: { entrada: Entrada; onCambio?: () => void }) {
  const { perfil, esEditor } = useAuth();
  const [mias, setMias] = useState<Autorizacion[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [subir, setSubir] = useState(false);
  const [verEntregas, setVerEntregas] = useState(false);
  const inputOficial = useRef<HTMLInputElement>(null);
  const [subiendoOficial, setSubiendoOficial] = useState(false);

  const cargar = useCallback(async () => {
    if (!perfil) return;
    const { data } = await getSupabase()
      .from("autorizaciones")
      .select("*")
      .eq("entrada_id", entrada.id)
      .order("created_at");
    const todas = (data ?? []) as Autorizacion[];
    setMias(todas.filter((a) => a.user_id === perfil.id));
    setTotal(todas.length);
  }, [entrada.id, perfil]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function borrar(a: Autorizacion) {
    if (!confirm(`¿Borrar la autorización de ${a.bailarin}?`)) return;
    const supabase = getSupabase();
    await supabase.storage.from("autorizaciones").remove([a.archivo_path]);
    await supabase.from("autorizaciones").delete().eq("id", a.id);
    cargar();
  }

  async function subirOficial(archivo: File | undefined) {
    if (!archivo) return;
    setSubiendoOficial(true);
    const supabase = getSupabase();
    const ruta = `${entrada.id}/${Date.now()}-${limpiar(archivo.name)}`;
    const { error } = await supabase.storage.from("documentos").upload(ruta, archivo, { contentType: archivo.type || undefined });
    if (!error) {
      if (entrada.documento_path) await supabase.storage.from("documentos").remove([entrada.documento_path]);
      await supabase.from("entradas").update({ documento_path: ruta }).eq("id", entrada.id);
      onCambio?.();
    } else {
      alert(error.message);
    }
    setSubiendoOficial(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-kanot-pink/25 bg-kanot-pink/[0.07] p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <FileText size={16} className="text-kanot-pink" /> Autorización
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href={`/app/autorizacion/${entrada.id}`}
          className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-kanot-pink hover:text-kanot-pink"
        >
          <Download size={16} /> Autorización ByKanot
        </Link>
        {entrada.documento_path && (
          <button
            type="button"
            onClick={() => abrirArchivo("documentos", entrada.documento_path!)}
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-kanot-pink hover:text-kanot-pink"
          >
            <Download size={16} /> Documento de la organización
          </button>
        )}
      </div>

      {mias.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {mias.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-300" />
              <span className="min-w-0 flex-1 truncate">
                Entregada · <b>{a.bailarin}</b>
                {a.grupo && <span className="text-white/55"> ({a.grupo})</span>}
              </span>
              <button type="button" onClick={() => abrirArchivo("autorizaciones", a.archivo_path)} aria-label="Ver" className="p-1 text-white/55 hover:text-white">
                <Eye size={16} />
              </button>
              <button type="button" onClick={() => borrar(a)} aria-label="Borrar" className="p-1 text-white/55 hover:text-white">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Boton onClick={() => setSubir(true)} className="w-full">
        <Upload size={16} /> {mias.length ? "Subir otra (otro bailarín/a)" : "Subir autorización firmada"}
      </Boton>

      {esEditor && (
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setVerEntregas(true)}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
          >
            <Users size={14} /> Ver entregas{total !== null ? ` (${total})` : ""}
          </button>
          <button
            type="button"
            onClick={() => inputOficial.current?.click()}
            disabled={subiendoOficial}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15 disabled:opacity-50"
          >
            <Upload size={14} />
            {subiendoOficial ? "Subiendo…" : entrada.documento_path ? "Cambiar documento oficial" : "Subir documento oficial"}
          </button>
          <input
            ref={inputOficial}
            type="file"
            accept="application/pdf,image/*,.doc,.docx"
            hidden
            onChange={(e) => {
              subirOficial(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {subir && (
        <SubirAutorizacion
          entrada={entrada}
          onCerrar={() => setSubir(false)}
          onSubida={() => {
            setSubir(false);
            cargar();
          }}
        />
      )}
      {verEntregas && <Entregas entrada={entrada} onCerrar={() => setVerEntregas(false)} onCambio={cargar} />}
    </div>
  );
}

function SubirAutorizacion({
  entrada,
  onCerrar,
  onSubida,
}: {
  entrada: Entrada;
  onCerrar: () => void;
  onSubida: () => void;
}) {
  const { perfil } = useAuth();
  const [bailarin, setBailarin] = useState("");
  const [grupo, setGrupo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!perfil || !archivo) return;
    setEnviando(true);
    setError(null);
    const supabase = getSupabase();
    const ruta = `${entrada.id}/${perfil.id}/${Date.now()}-${limpiar(archivo.name)}`;
    const { error: e1 } = await supabase.storage
      .from("autorizaciones")
      .upload(ruta, archivo, { contentType: archivo.type || undefined });
    if (e1) {
      setError(/bucket not found/i.test(e1.message) ? "Falta activar las autorizaciones (SQL 006)." : e1.message);
      setEnviando(false);
      return;
    }
    const { error: e2 } = await supabase.from("autorizaciones").insert({
      entrada_id: entrada.id,
      bailarin: bailarin.trim(),
      grupo: grupo || null,
      archivo_path: ruta,
      subido_por: perfil.nombre ?? perfil.email,
    });
    if (e2) {
      await supabase.storage.from("autorizaciones").remove([ruta]);
      setError(e2.message);
      setEnviando(false);
      return;
    }
    onSubida();
  }

  return (
    <Modal titulo={`Autorización · ${entrada.titulo}`} onCerrar={onCerrar}>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Etiqueta texto="Nombre y apellidos del bailarín/a">
          <Input value={bailarin} onChange={(e) => setBailarin(e.target.value)} required autoFocus />
        </Etiqueta>
        <Etiqueta texto="Grupo">
          <Select value={grupo} onChange={(e) => setGrupo(e.target.value)} required>
            <option value="">Elige el grupo</option>
            {GRUPOS_BAILE.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Etiqueta>
        <Etiqueta texto="Autorización firmada (foto o PDF)">
          <input
            type="file"
            accept="image/*,application/pdf"
            required
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-dashed border-white/25 bg-white/5 p-4 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-kanot-pink file:px-4 file:py-2 file:text-sm file:font-bold file:text-kanot-navy-deep"
          />
        </Etiqueta>
        <p className="text-xs text-white/50">Puedes hacerle una foto con el móvil. Que se lea bien la firma.</p>
        {error && <Aviso>{error}</Aviso>}
        <Boton type="submit" disabled={enviando || !archivo}>
          {enviando ? "Subiendo…" : "Enviar autorización"}
        </Boton>
      </form>
    </Modal>
  );
}

/** Lista de entregas para editores/admins, agrupada por grupo. */
function Entregas({ entrada, onCerrar, onCambio }: { entrada: Entrada; onCerrar: () => void; onCambio: () => void }) {
  const [lista, setLista] = useState<Autorizacion[] | null>(null);

  const cargar = useCallback(async () => {
    const { data } = await getSupabase()
      .from("autorizaciones")
      .select("*")
      .eq("entrada_id", entrada.id)
      .order("bailarin");
    setLista((data ?? []) as Autorizacion[]);
  }, [entrada.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function borrar(a: Autorizacion) {
    if (!confirm(`¿Borrar la autorización de ${a.bailarin}?`)) return;
    const supabase = getSupabase();
    await supabase.storage.from("autorizaciones").remove([a.archivo_path]);
    await supabase.from("autorizaciones").delete().eq("id", a.id);
    cargar();
    onCambio();
  }

  const porGrupo = [...GRUPOS_BAILE, "Sin grupo"].map((g) => ({
    grupo: g,
    items: (lista ?? []).filter((a) => (a.grupo ?? "Sin grupo") === g),
  }));

  return (
    <Modal titulo={`Entregas · ${entrada.titulo}`} onCerrar={onCerrar}>
      {!lista ? (
        <p className="text-sm text-white/60">Cargando…</p>
      ) : lista.length === 0 ? (
        <p className="text-sm text-white/60">Todavía nadie ha subido la autorización.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-white/65">
            {lista.length} {lista.length === 1 ? "autorización entregada" : "autorizaciones entregadas"}
          </p>
          {porGrupo
            .filter((g) => g.items.length)
            .map((g) => (
              <section key={g.grupo}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-kanot-pink">
                  {g.grupo} · {g.items.length}
                </h3>
                <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
                  {g.items.map((a) => (
                    <li key={a.id} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{a.bailarin}</span>
                        <span className="block truncate text-xs text-white/45">
                          {a.subido_por ?? "—"} · {new Date(a.created_at).toLocaleDateString("es-ES")}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => abrirArchivo("autorizaciones", a.archivo_path)}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
                      >
                        Ver
                      </button>
                      <button type="button" onClick={() => borrar(a)} aria-label="Borrar" className="p-1.5 text-white/45 hover:text-white">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}
    </Modal>
  );
}
