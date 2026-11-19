"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { comprimirImagen } from "./comprimirImagen";
import { Download, ImagePlus, Play, Trash2, X } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { Aviso, Boton, Cargando } from "./ui";

type Medio = {
  id: string;
  user_id: string;
  subido_por: string | null;
  archivo_path: string;
  tipo: "foto" | "video";
  created_at: string;
  url?: string;
};

const BUCKET = "crew";
const MAX_MB = 50;

function limpiar(nombre: string) {
  return nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
}

/** Galería compartida de Kanot Crew: cualquier miembro sube fotos y vídeos; borra cada uno lo suyo (y editores/admins todo). */
export default function GaleriaCrew() {
  const { perfil, esEditor } = useAuth();
  const [medios, setMedios] = useState<Medio[] | null>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<Medio | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("crew_media").select("*").order("created_at", { ascending: false });
    if (error) {
      setError(/does not exist|schema cache/i.test(error.message) ? "Falta activar la galería (SQL 007)." : error.message);
      setMedios([]);
      return;
    }
    const lista = (data ?? []) as Medio[];
    if (lista.length) {
      const { data: urls } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(lista.map((m) => m.archivo_path), 60 * 60);
      lista.forEach((m, i) => (m.url = urls?.[i]?.signedUrl ?? undefined));
    }
    setMedios(lista);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function subir(archivos: FileList) {
    if (!perfil) return;
    setError(null);
    const supabase = getSupabase();
    const lista = Array.from(archivos);
    for (const [i, original] of lista.entries()) {
      // Las fotos se reducen en el móvil antes de subirlas (ocupan ~10 veces menos).
      setSubiendo(`Preparando ${i + 1} de ${lista.length}…`);
      const f = original.type.startsWith("image/") ? await comprimirImagen(original) : original;
      const tipo = f.type.startsWith("video/") ? "video" : f.type.startsWith("image/") ? "foto" : null;
      if (!tipo) {
        setError(`${f.name}: solo fotos o vídeos.`);
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`${f.name}: pesa más de ${MAX_MB} MB.`);
        continue;
      }
      setSubiendo(`Subiendo ${i + 1} de ${lista.length}…`);
      const ruta = `${perfil.id}/${Date.now()}-${limpiar(f.name)}`;
      const { error: e1 } = await supabase.storage.from(BUCKET).upload(ruta, f, { contentType: f.type });
      if (e1) {
        setError(`${f.name}: ${e1.message}`);
        continue;
      }
      const { error: e2 } = await supabase
        .from("crew_media")
        .insert({ archivo_path: ruta, tipo, subido_por: perfil.nombre ?? perfil.email });
      if (e2) {
        await supabase.storage.from(BUCKET).remove([ruta]);
        setError(e2.message);
      }
    }
    setSubiendo(null);
    cargar();
  }

  async function borrar(m: Medio) {
    if (!confirm("¿Borrar este archivo de la galería?")) return;
    const supabase = getSupabase();
    await supabase.storage.from(BUCKET).remove([m.archivo_path]);
    await supabase.from("crew_media").delete().eq("id", m.id);
    setAbierto(null);
    cargar();
  }

  /** Descarga el archivo original con un enlace temporal (cualquier miembro). */
  async function descargar(m: Medio) {
    const nombre = m.archivo_path.split("/").pop()?.replace(/^\d+-/, "") || "kanot";
    const ventana = window.open("", "_blank");
    const { data, error } = await getSupabase().storage.from(BUCKET).createSignedUrl(m.archivo_path, 600, { download: nombre });
    if (error || !data) {
      ventana?.close();
      setError(error?.message ?? "No se pudo descargar.");
      return;
    }
    if (ventana) ventana.location.href = data.signedUrl;
    else window.location.assign(data.signedUrl);
  }

  const puedeBorrar = (m: Medio) => esEditor || m.user_id === perfil?.id;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Fotos y vídeos de la crew</h2>
          <p className="text-xs text-white/55">Cualquier miembro puede subir. Máx. {MAX_MB} MB por archivo.</p>
        </div>
        <Boton onClick={() => input.current?.click()} disabled={!!subiendo} className="shrink-0 px-4">
          <ImagePlus size={17} /> Subir
        </Boton>
        <input
          ref={input}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) subir(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {subiendo && <Aviso tipo="ok">{subiendo}</Aviso>}
      {error && <Aviso>{error}</Aviso>}
      {!medios && <Cargando />}
      {medios?.length === 0 && !error && (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
          Todavía no hay nada. ¡Sube las primeras fotos de los ensayos!
        </p>
      )}

      {medios && medios.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {medios.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAbierto(m)}
              className="relative aspect-square overflow-hidden rounded-lg bg-white/5"
            >
              {m.url &&
                (m.tipo === "video" ? (
                  <video src={`${m.url}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- archivo privado con enlace firmado
                  <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ))}
              {m.tipo === "video" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60">
                    <Play size={14} fill="currentColor" />
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {abierto && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={() => setAbierto(null)}>
          <div className="flex items-center justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]" onClick={(e) => e.stopPropagation()}>
            <p className="min-w-0 truncate text-sm text-white/70">
              {abierto.subido_por ?? "—"} · {new Date(abierto.created_at).toLocaleDateString("es-ES")}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => descargar(abierto)}
                aria-label="Descargar"
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
              >
                <Download size={18} /> Descargar
              </button>
              {puedeBorrar(abierto) && (
                <button type="button" onClick={() => borrar(abierto)} aria-label="Borrar" className="rounded-full p-2 hover:bg-white/10">
                  <Trash2 size={20} />
                </button>
              )}
              <button type="button" onClick={() => setAbierto(null)} aria-label="Cerrar" className="rounded-full p-2 hover:bg-white/10">
                <X size={22} />
              </button>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {abierto.tipo === "video" ? (
              <video src={abierto.url} controls autoPlay playsInline className="max-h-full max-w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- archivo privado con enlace firmado
              <img src={abierto.url} alt="" className="max-h-full max-w-full object-contain" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
