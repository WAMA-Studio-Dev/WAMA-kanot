"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Trash2, X } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { Aviso, Boton, Cargando } from "./ui";

const BUCKET = "portfolio";

type Foto = { nombre: string; url: string };

function limpiar(nombre: string) {
  return nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
}

/** Portfolio de fotografía: lo ve todo el mundo, lo suben y borran editores y admins. */
export default function Portfolio() {
  const { esEditor } = useAuth();
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const cargar = useCallback(async () => {
    const almacen = getSupabase().storage.from(BUCKET);
    const { data, error } = await almacen.list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
    if (error) {
      setError(/bucket not found/i.test(error.message) ? "Falta activar el portfolio (SQL 007)." : error.message);
      setFotos([]);
      return;
    }
    setFotos(
      (data ?? [])
        .filter((f) => f.id && f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({ nombre: f.name, url: almacen.getPublicUrl(f.name).data.publicUrl })),
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function subir(archivos: FileList) {
    setError(null);
    const almacen = getSupabase().storage.from(BUCKET);
    const lista = Array.from(archivos);
    for (const [i, f] of lista.entries()) {
      setSubiendo(`Subiendo ${i + 1} de ${lista.length}…`);
      const { error } = await almacen.upload(`${Date.now()}-${limpiar(f.name)}`, f, { contentType: f.type });
      if (error) setError(`${f.name}: ${error.message}`);
    }
    setSubiendo(null);
    cargar();
  }

  async function borrar(f: Foto) {
    if (!confirm("¿Quitar esta foto del portfolio?")) return;
    await getSupabase().storage.from(BUCKET).remove([f.nombre]);
    setAbierta(null);
    cargar();
  }

  const actual = abierta !== null && fotos ? fotos[abierta] : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-xl font-black">Portfolio</h2>
        {esEditor && (
          <>
            <Boton onClick={() => input.current?.click()} disabled={!!subiendo} className="px-4">
              <ImagePlus size={17} /> Añadir fotos
            </Boton>
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) subir(e.target.files);
                e.target.value = "";
              }}
            />
          </>
        )}
      </div>

      {subiendo && <Aviso tipo="ok">{subiendo}</Aviso>}
      {error && <Aviso>{error}</Aviso>}
      {!fotos && <Cargando />}
      {fotos?.length === 0 && !error && (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
          {esEditor ? "Añade las primeras fotos del portfolio." : "Muy pronto, el portfolio."}
        </p>
      )}

      {fotos && fotos.length > 0 && (
        <div className="columns-2 gap-2 sm:columns-3">
          {fotos.map((f, i) => (
            <button key={f.nombre} type="button" onClick={() => setAbierta(i)} className="mb-2 block w-full overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto pública de Supabase Storage */}
              <img src={f.url} alt="" loading="lazy" className="w-full transition duration-300 hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {actual && fotos && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={() => setAbierta(null)}>
          <div className="flex justify-end gap-1 p-4 pt-[max(1rem,env(safe-area-inset-top))]" onClick={(e) => e.stopPropagation()}>
            {esEditor && (
              <button type="button" onClick={() => borrar(actual)} aria-label="Quitar" className="rounded-full p-2 hover:bg-white/10">
                <Trash2 size={20} />
              </button>
            )}
            <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="rounded-full p-2 hover:bg-white/10">
              <X size={22} />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- foto pública de Supabase Storage */}
            <img src={actual.url} alt="" className="max-h-full max-w-full object-contain" />
            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={() => setAbierta((abierta! - 1 + fotos.length) % fotos.length)}
                  className="absolute left-2 rounded-full bg-black/50 p-2"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  onClick={() => setAbierta((abierta! + 1) % fotos.length)}
                  className="absolute right-2 rounded-full bg-black/50 p-2"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
