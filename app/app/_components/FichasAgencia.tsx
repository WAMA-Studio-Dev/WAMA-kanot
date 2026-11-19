"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Share2, Trash2, UserRound } from "lucide-react";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import { getSupabase } from "@/app/lib/supabase/client";
import { comprimirImagen } from "./comprimirImagen";
import { Aviso, Boton, Cargando, Etiqueta, Input, Modal, Textarea } from "./ui";

type Ficha = {
  id: string;
  nombre: string;
  estilos: string | null;
  ciudad: string | null;
  instagram: string | null;
  descripcion: string | null;
  foto_path: string | null;
  url?: string;
};

const BUCKET = "agencia";

/** Fichas de los bailarines de la agencia (solo editores y admins). */
export default function FichasAgencia() {
  const [fichas, setFichas] = useState<Ficha[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Ficha | "nueva" | null>(null);
  const [copiada, setCopiada] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("agencia_bailarines").select("*").order("nombre");
    if (error) {
      setError(/agencia_bailarines|schema cache/i.test(error.message) ? "Falta activar el SQL 024." : error.message);
      setFichas([]);
      return;
    }
    const lista = (data ?? []) as Ficha[];
    const rutas = lista.map((f) => f.foto_path).filter((r): r is string => Boolean(r));
    if (rutas.length) {
      const { data: urls } = await supabase.storage.from(BUCKET).createSignedUrls(rutas, 60 * 60);
      for (const f of lista) f.url = urls?.find((u) => u.path === f.foto_path)?.signedUrl ?? undefined;
    }
    setFichas(lista);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function borrar(f: Ficha) {
    if (!confirm(`¿Borrar la ficha de ${f.nombre}?`)) return;
    const supabase = getSupabase();
    if (f.foto_path) await supabase.storage.from(BUCKET).remove([f.foto_path]);
    await supabase.from("agencia_bailarines").delete().eq("id", f.id);
    cargar();
  }

  /** Comparte la ficha como texto (WhatsApp, correo…) o la copia. */
  async function compartir(f: Ficha) {
    const texto = [
      `${f.nombre} · ByKanot Agencia`,
      f.estilos && `Estilos: ${f.estilos}`,
      f.ciudad && `Ciudad: ${f.ciudad}`,
      f.descripcion,
      f.instagram && `Instagram: https://instagram.com/${f.instagram.replace(/^@/, "")}`,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      if (navigator.share) await navigator.share({ title: f.nombre, text: texto });
      else {
        await navigator.clipboard.writeText(texto);
        setCopiada(f.id);
        setTimeout(() => setCopiada(null), 2000);
      }
    } catch {
      /* cancelado */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/60">La ficha de cada bailarín, lista para pasarla a quien os contrate.</p>
        <Boton onClick={() => setEditando("nueva")} className="shrink-0 px-4 py-2">
          <Plus size={16} /> Nueva
        </Boton>
      </div>
      {error && <Aviso>{error}</Aviso>}
      {!fichas && <Cargando />}
      {fichas?.length === 0 && !error && (
        <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
          Añade la primera ficha con “Nueva”.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {fichas?.map((f) => (
          <article key={f.id} className="flex gap-4 rounded-3xl border border-white/10 bg-black/25 p-4">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/5">
              {f.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- foto privada con enlace firmado
                <img src={f.url} alt={f.nombre} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-white/30">
                  <UserRound size={28} />
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-base font-bold">{f.nombre}</p>
              {f.estilos && <p className="text-xs font-semibold text-kanot-pink">{f.estilos}</p>}
              {f.ciudad && <p className="text-xs text-white/55">{f.ciudad}</p>}
              {f.descripcion && <p className="line-clamp-2 text-xs text-white/70">{f.descripcion}</p>}
              <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
                {f.instagram && (
                  <a
                    href={`https://instagram.com/${f.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/15"
                  >
                    <InstagramIcon className="h-3 w-3" /> @{f.instagram.replace(/^@/, "")}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => compartir(f)}
                  className="flex items-center gap-1 rounded-full bg-kanot-pink/15 px-2.5 py-1 text-[11px] font-semibold text-kanot-pink hover:bg-kanot-pink/25"
                >
                  <Share2 size={12} /> {copiada === f.id ? "Copiada" : "Compartir"}
                </button>
                <button type="button" onClick={() => setEditando(f)} aria-label="Editar" className="ml-auto p-1.5 text-white/45 hover:text-white">
                  <Pencil size={14} />
                </button>
                <button type="button" onClick={() => borrar(f)} aria-label="Borrar" className="p-1.5 text-white/45 hover:text-white">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editando && (
        <FormFicha
          ficha={editando === "nueva" ? null : editando}
          onCerrar={() => setEditando(null)}
          onGuardada={() => {
            setEditando(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function FormFicha({ ficha, onCerrar, onGuardada }: { ficha: Ficha | null; onCerrar: () => void; onGuardada: () => void }) {
  const [datos, setDatos] = useState({
    nombre: ficha?.nombre ?? "",
    estilos: ficha?.estilos ?? "",
    ciudad: ficha?.ciudad ?? "",
    instagram: ficha?.instagram ?? "",
    descripcion: ficha?.descripcion ?? "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const campo = (k: keyof typeof datos) => ({
    value: datos[k],
    onChange: (e: { target: { value: string } }) => setDatos({ ...datos, [k]: e.target.value }),
  });

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const supabase = getSupabase();
    let foto_path = ficha?.foto_path ?? null;
    if (foto) {
      const f = await comprimirImagen(foto, { maxLado: 1400, calidad: 0.86 });
      const ruta = `${Date.now()}.jpg`;
      const { error: e1 } = await supabase.storage.from(BUCKET).upload(ruta, f, { contentType: f.type });
      if (e1) {
        setGuardando(false);
        return setError(/bucket not found|row-level/i.test(e1.message) ? "Falta activar el SQL 024." : e1.message);
      }
      if (foto_path) await supabase.storage.from(BUCKET).remove([foto_path]);
      foto_path = ruta;
    }
    const fila = {
      nombre: datos.nombre.trim(),
      estilos: datos.estilos.trim() || null,
      ciudad: datos.ciudad.trim() || null,
      instagram: datos.instagram.trim().replace(/^@/, "") || null,
      descripcion: datos.descripcion.trim() || null,
      foto_path,
    };
    const { error } = ficha
      ? await supabase.from("agencia_bailarines").update(fila).eq("id", ficha.id)
      : await supabase.from("agencia_bailarines").insert(fila);
    setGuardando(false);
    if (error) return setError(/agencia_bailarines|schema cache/i.test(error.message) ? "Falta activar el SQL 024." : error.message);
    onGuardada();
  }

  return (
    <Modal titulo={ficha ? `Editar · ${ficha.nombre}` : "Nueva ficha"} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Etiqueta texto="Nombre artístico o nombre y apellidos">
          <Input {...campo("nombre")} required autoFocus />
        </Etiqueta>
        <Etiqueta texto="Estilos">
          <Input {...campo("estilos")} placeholder="Hip hop, commercial, heels…" />
        </Etiqueta>
        <Etiqueta texto="Ciudad">
          <Input {...campo("ciudad")} placeholder="Sevilla" />
        </Etiqueta>
        <Etiqueta texto="Instagram">
          <Input {...campo("instagram")} placeholder="@usuario" autoCapitalize="none" />
        </Etiqueta>
        <Etiqueta texto="Sobre el bailarín (experiencia, trabajos…)">
          <Textarea {...campo("descripcion")} rows={3} maxLength={500} />
        </Etiqueta>
        <Etiqueta texto={ficha?.foto_path ? "Cambiar foto (opcional)" : "Foto (opcional)"}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-dashed border-white/25 bg-white/5 p-4 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-kanot-pink file:px-4 file:py-2 file:text-sm file:font-bold file:text-kanot-navy-deep"
          />
        </Etiqueta>
        {error && <Aviso>{error}</Aviso>}
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar ficha"}
        </Boton>
      </form>
    </Modal>
  );
}
