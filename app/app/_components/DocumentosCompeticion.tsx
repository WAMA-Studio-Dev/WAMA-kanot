"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Download, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import type { Entrada } from "./secciones";
import { Aviso, Boton, Etiqueta, Input, Modal, Select } from "./ui";
import { abrirArchivo, limpiar } from "./BloqueAutorizacion";

type Documento = {
  id: string;
  entrada_id: string;
  tipo: string;
  nombre: string;
  archivo_path: string;
  created_at: string;
};

/** Tipos de archivo de un campeonato (en este orden salen en la tarjeta). */
export const TIPOS_DOCUMENTO = ["Autorización", "Bases / normativa", "Horarios", "Música", "Otros"] as const;

/** Documentos de un campeonato, separados por tipo. Editores y admins suben, renombran y borran. */
export default function DocumentosCompeticion({ entrada }: { entrada: Entrada }) {
  const { esEditor } = useAuth();
  const [docs, setDocs] = useState<Documento[] | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [subir, setSubir] = useState(false);
  const [editando, setEditando] = useState<Documento | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("documentos_competicion")
      .select("*")
      .eq("entrada_id", entrada.id)
      .order("created_at");
    if (error) {
      setAviso(/documentos_competicion|schema cache/i.test(error.message) ? "Falta activar el SQL 020 para los documentos." : error.message);
      setDocs([]);
    } else {
      setAviso(null);
      setDocs((data ?? []) as Documento[]);
    }
  }, [entrada.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  if (!docs) return null;
  if (!docs.length && !esEditor) return null;

  async function borrar(d: Documento) {
    if (!confirm(`¿Borrar "${d.nombre}"?`)) return;
    const supabase = getSupabase();
    await supabase.storage.from("documentos").remove([d.archivo_path]);
    await supabase.from("documentos_competicion").delete().eq("id", d.id);
    cargar();
  }

  const tipos = [...TIPOS_DOCUMENTO, ...new Set(docs.map((d) => d.tipo).filter((t) => !(TIPOS_DOCUMENTO as readonly string[]).includes(t)))];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <FolderOpen size={16} className="text-kanot-pink" /> Documentos
      </p>

      {tipos.map((t) => {
        const delTipo = docs.filter((d) => d.tipo === t);
        if (!delTipo.length) return null;
        return (
          <section key={t} className="flex flex-col gap-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white/50">{t}</h4>
            <ul className="flex flex-col gap-1.5">
              {delTipo.map((d) => (
                <li key={d.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => abrirArchivo("documentos", d.archivo_path)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-left text-sm font-semibold transition hover:border-kanot-pink hover:text-kanot-pink"
                  >
                    <Download size={16} className="shrink-0" />
                    <span className="truncate">{d.nombre}</span>
                  </button>
                  {esEditor && (
                    <>
                      <button type="button" onClick={() => setEditando(d)} aria-label="Cambiar nombre o tipo" className="p-1.5 text-white/50 hover:text-white">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => borrar(d)} aria-label="Borrar" className="p-1.5 text-white/50 hover:text-white">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {!docs.length && <p className="text-xs text-white/50">Todavía no hay documentos para este campeonato.</p>}
      {aviso && <p className="text-xs text-red-200">{aviso}</p>}

      {esEditor && (
        <button
          type="button"
          onClick={() => setSubir(true)}
          className="flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
        >
          <Plus size={14} /> Subir documento
        </button>
      )}

      {subir && (
        <FormDocumento
          entrada={entrada}
          onCerrar={() => setSubir(false)}
          onGuardado={() => {
            setSubir(false);
            cargar();
          }}
        />
      )}
      {editando && (
        <FormDocumento
          entrada={entrada}
          documento={editando}
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

/** Subir un documento nuevo o cambiar el nombre/tipo de uno que ya está. */
function FormDocumento({
  entrada,
  documento,
  onCerrar,
  onGuardado,
}: {
  entrada: Entrada;
  documento?: Documento;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [tipo, setTipo] = useState(documento?.tipo ?? "Autorización");
  const [nombre, setNombre] = useState(documento?.nombre ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const supabase = getSupabase();
    const titulo = nombre.trim() || archivo?.name.replace(/\.[^.]+$/, "") || tipo;

    if (documento) {
      const { error } = await supabase.from("documentos_competicion").update({ tipo, nombre: titulo }).eq("id", documento.id);
      setGuardando(false);
      if (error) return setError(error.message);
      return onGuardado();
    }

    if (!archivo) return setGuardando(false);
    const ruta = `${entrada.id}/${Date.now()}-${limpiar(archivo.name)}`;
    const { error: e1 } = await supabase.storage.from("documentos").upload(ruta, archivo, { contentType: archivo.type || undefined });
    if (e1) {
      setGuardando(false);
      return setError(e1.message);
    }
    const { error: e2 } = await supabase
      .from("documentos_competicion")
      .insert({ entrada_id: entrada.id, tipo, nombre: titulo, archivo_path: ruta });
    if (e2) {
      await supabase.storage.from("documentos").remove([ruta]);
      setGuardando(false);
      return setError(/documentos_competicion|schema cache/i.test(e2.message) ? "Falta activar el SQL 020 para los documentos." : e2.message);
    }
    onGuardado();
  }

  return (
    <Modal titulo={documento ? "Cambiar documento" : `Subir documento · ${entrada.titulo}`} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Etiqueta texto="¿Qué es?">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Etiqueta>
        <Etiqueta texto="Nombre que verá la gente">
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={tipo === "Autorización" ? "p. ej. Autorización oficial Jack Unit" : "p. ej. Bases del campeonato"}
            required={Boolean(documento)}
          />
        </Etiqueta>
        {!documento && (
          <Etiqueta texto="Archivo (PDF, foto o Word)">
            <input
              type="file"
              accept="application/pdf,image/*,.doc,.docx,audio/*"
              required
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-dashed border-white/25 bg-white/5 p-4 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-kanot-pink file:px-4 file:py-2 file:text-sm file:font-bold file:text-kanot-navy-deep"
            />
          </Etiqueta>
        )}
        {error && <Aviso>{error}</Aviso>}
        <Boton type="submit" disabled={guardando || (!documento && !archivo)}>
          {guardando ? "Guardando…" : documento ? "Guardar" : "Subir"}
        </Boton>
      </form>
    </Modal>
  );
}
