"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import {
  ChevronRight,
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  Folder,
  FolderPlus,
  HardDrive,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { Aviso, Boton, Cargando, Etiqueta, Input, Modal } from "./ui";

const BUCKET = "archivos";
const MARCADOR = ".emptyFolderPlaceholder";

type Item = {
  nombre: string;
  esCarpeta: boolean;
  tamano: number;
  tipo: string;
  actualizado: string | null;
};

type Dialogo = { tipo: "carpeta" } | { tipo: "renombrar"; item: Item } | null;

/**
 * Gestor de archivos del bucket privado.
 * Con `raiz`, queda limitado a esa carpeta (p. ej. "Kanot Crew") y se muestra sin cabecera.
 */
export default function GestorArchivos({ raiz }: { raiz?: string }) {
  const { esEditor } = useAuth();
  const [ruta, setRuta] = useState<string[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const inputArchivos = useRef<HTMLInputElement>(null);

  const prefijo = [raiz, ...ruta].filter(Boolean).join("/");
  const camino = (nombre: string) => (prefijo ? `${prefijo}/${nombre}` : nombre);

  const cargar = useCallback(async () => {
    setItems(null);
    setError(null);
    const { data, error } = await getSupabase()
      .storage.from(BUCKET)
      .list(prefijo || undefined, { limit: 1000, sortBy: { column: "name", order: "asc" } });
    if (error) {
      setError(error.message);
      setItems([]);
      return;
    }
    const lista: Item[] = data
      .filter((d) => d.name !== MARCADOR)
      .map((d) => ({
        nombre: d.name,
        esCarpeta: d.id === null,
        tamano: (d.metadata?.size as number) ?? 0,
        tipo: (d.metadata?.mimetype as string) ?? "",
        actualizado: d.updated_at ?? null,
      }))
      .sort((a, b) => Number(b.esCarpeta) - Number(a.esCarpeta) || a.nombre.localeCompare(b.nombre, "es"));
    setItems(lista);
  }, [prefijo]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga al cambiar de carpeta
    if (esEditor) cargar();
  }, [cargar, esEditor]);

  if (!esEditor) return <Aviso>Esta sección es solo para editores y administradores.</Aviso>;

  async function subir(archivos: FileList | File[]) {
    const lista = Array.from(archivos);
    if (!lista.length) return;
    setError(null);
    const supabase = getSupabase();
    for (const [i, f] of lista.entries()) {
      setSubiendo(`Subiendo ${i + 1} de ${lista.length}: ${f.name}`);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(camino(limpiarNombre(f.name)), f, { upsert: true, contentType: f.type || undefined });
      if (error) {
        setError(`${f.name}: ${error.message}`);
        break;
      }
    }
    setSubiendo(null);
    cargar();
  }

  async function abrir(item: Item, descargar: boolean) {
    // Abrimos la pestaña antes del await para que Safari (iPhone) no la bloquee.
    const ventana = window.open("", "_blank");
    const { data, error } = await getSupabase()
      .storage.from(BUCKET)
      .createSignedUrl(camino(item.nombre), 60 * 10, descargar ? { download: item.nombre } : undefined);
    if (error) {
      ventana?.close();
      setError(error.message);
      return;
    }
    if (ventana) ventana.location.href = data.signedUrl;
    else window.location.assign(data.signedUrl);
  }

  async function borrar(item: Item) {
    const aviso = item.esCarpeta
      ? `¿Borrar la carpeta “${item.nombre}” y TODO lo que contiene? No se puede deshacer.`
      : `¿Borrar “${item.nombre}”? No se puede deshacer.`;
    if (!confirm(aviso)) return;
    const supabase = getSupabase();
    const rutas = item.esCarpeta ? await listarTodo(camino(item.nombre)) : [camino(item.nombre)];
    for (let i = 0; i < rutas.length; i += 100) {
      const { error } = await supabase.storage.from(BUCKET).remove(rutas.slice(i, i + 100));
      if (error) return setError(error.message);
    }
    cargar();
  }

  async function aceptarDialogo(nombre: string) {
    if (!dialogo) return null;
    const limpio = limpiarNombre(nombre);
    const almacen = getSupabase().storage.from(BUCKET);
    const { error } =
      dialogo.tipo === "carpeta"
        ? await almacen.upload(`${camino(limpio)}/${MARCADOR}`, new Blob([""]), { contentType: "text/plain" })
        : await almacen.move(camino(dialogo.item.nombre), camino(limpio));
    if (error) return error.message;
    setDialogo(null);
    cargar();
    return null;
  }

  function soltar(e: DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    if (e.dataTransfer.files.length) subir(e.dataTransfer.files);
  }

  return (
    <div
      className="flex flex-col gap-5"
      onDragOver={(e) => {
        e.preventDefault();
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={soltar}
    >
      <div className={`flex flex-wrap items-center gap-3 ${raiz ? "justify-end" : "justify-between"}`}>
        {!raiz && (
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kanot-electric/20 text-kanot-electric">
              <HardDrive size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Archivos</h1>
              <p className="text-sm text-white/55">Solo visible para editores y admins</p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Boton variante="secundario" onClick={() => setDialogo({ tipo: "carpeta" })}>
            <FolderPlus size={18} /> <span className="hidden sm:inline">Carpeta</span>
          </Boton>
          <Boton onClick={() => inputArchivos.current?.click()} disabled={!!subiendo}>
            <Upload size={18} /> Subir
          </Boton>
          <input
            ref={inputArchivos}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) subir(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Ruta">
        <MigaDePan activa={ruta.length === 0} onClick={() => setRuta([])}>
          {raiz ?? "Archivos"}
        </MigaDePan>
        {ruta.map((parte, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-white/30" />
            <MigaDePan activa={i === ruta.length - 1} onClick={() => setRuta(ruta.slice(0, i + 1))}>
              {parte}
            </MigaDePan>
          </span>
        ))}
      </nav>

      {subiendo && <Aviso tipo="ok">{subiendo}</Aviso>}
      {error && <Aviso>{error}</Aviso>}

      <div
        className={`overflow-hidden rounded-3xl border transition ${
          arrastrando ? "border-kanot-pink bg-kanot-pink/10" : "border-white/10 bg-black/25"
        }`}
      >
        {!items && <Cargando />}
        {items && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-white/55">
            <Upload size={28} />
            <p>Carpeta vacía. Arrastra archivos aquí o pulsa “Subir”.</p>
          </div>
        )}
        {items && items.length > 0 && (
          <ul className="divide-y divide-white/5">
            {items.map((item) => (
              <li key={item.nombre} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
                <button
                  type="button"
                  onClick={() => (item.esCarpeta ? setRuta([...ruta, item.nombre]) : abrir(item, false))}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <IconoArchivo item={item} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{item.nombre}</span>
                    {!item.esCarpeta && (
                      <span className="block text-xs text-white/45">
                        {formatearTamano(item.tamano)}
                        {item.actualizado && ` · ${new Date(item.actualizado).toLocaleDateString("es-ES")}`}
                      </span>
                    )}
                  </span>
                </button>
                <div className="flex shrink-0">
                  {!item.esCarpeta && (
                    <>
                      <AccionIcono etiqueta="Descargar" onClick={() => abrir(item, true)}>
                        <Download size={17} />
                      </AccionIcono>
                      <AccionIcono etiqueta="Renombrar" onClick={() => setDialogo({ tipo: "renombrar", item })}>
                        <Pencil size={17} />
                      </AccionIcono>
                    </>
                  )}
                  <AccionIcono etiqueta="Borrar" onClick={() => borrar(item)}>
                    <Trash2 size={17} />
                  </AccionIcono>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="hidden text-center text-xs text-white/40 sm:block">
        Puedes arrastrar archivos desde tu ordenador a esta ventana. Máximo 50 MB por archivo.
      </p>

      {dialogo && (
        <DialogoNombre
          titulo={dialogo.tipo === "carpeta" ? "Nueva carpeta" : "Renombrar archivo"}
          inicial={dialogo.tipo === "renombrar" ? dialogo.item.nombre : ""}
          onCerrar={() => setDialogo(null)}
          onAceptar={aceptarDialogo}
        />
      )}
    </div>
  );
}

function MigaDePan({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2 py-1 hover:bg-white/10 ${activa ? "font-semibold text-kanot-pink" : "text-white/70"}`}
    >
      {children}
    </button>
  );
}

function DialogoNombre({
  titulo,
  inicial,
  onCerrar,
  onAceptar,
}: {
  titulo: string;
  inicial: string;
  onCerrar: () => void;
  onAceptar: (nombre: string) => Promise<string | null>;
}) {
  const [nombre, setNombre] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setEnviando(true);
          setError(await onAceptar(nombre));
          setEnviando(false);
        }}
      >
        <Etiqueta texto="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus />
        </Etiqueta>
        {error && <Aviso>{error}</Aviso>}
        <div className="flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={enviando || !nombre.trim()}>
            Guardar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}

function AccionIcono({ etiqueta, onClick, children }: { etiqueta: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function IconoArchivo({ item }: { item: Item }) {
  if (item.esCarpeta) return <Folder size={22} className="shrink-0 fill-kanot-pink/25 text-kanot-pink" />;
  const ext = item.nombre.split(".").pop()?.toLowerCase() ?? "";
  if (["xls", "xlsx", "csv", "ods", "numbers"].includes(ext))
    return <FileSpreadsheet size={22} className="shrink-0 text-emerald-300" />;
  if (item.tipo.startsWith("image/")) return <FileImage size={22} className="shrink-0 text-kanot-electric" />;
  if (item.tipo.startsWith("video/")) return <Film size={22} className="shrink-0 text-purple-300" />;
  if (["pdf", "doc", "docx", "txt", "pages", "odt"].includes(ext))
    return <FileText size={22} className="shrink-0 text-orange-200" />;
  return <File size={22} className="shrink-0 text-white/60" />;
}

/** Supabase solo admite ciertos caracteres en las rutas: quitamos tildes, ñ, etc. */
function limpiarNombre(nombre: string) {
  return (
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w.\-() ]+/g, "_")
      .replace(/\s+/g, " ")
      .trim() || "archivo"
  );
}

async function listarTodo(carpeta: string): Promise<string[]> {
  const { data } = await getSupabase().storage.from(BUCKET).list(carpeta, { limit: 1000 });
  const rutas: string[] = [];
  for (const d of data ?? []) {
    const r = `${carpeta}/${d.name}`;
    if (d.id === null) rutas.push(...(await listarTodo(r)));
    else rutas.push(r);
  }
  return rutas;
}

function formatearTamano(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
