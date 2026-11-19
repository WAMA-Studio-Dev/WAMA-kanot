"use client";

import { comprimirImagen } from "./comprimirImagen";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Bell, CheckCircle2, Eye, FileText, Pencil, Trash2, Upload, Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { GRUPOS, type Entrada } from "./secciones";
import { Aviso, Boton, Etiqueta, Input, Modal, Select } from "./ui";
import { enviarNotificacion } from "./notificaciones";

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

export function limpiar(nombre: string) {
  return nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]+/g, "_");
}

export async function abrirArchivo(bucket: string, ruta: string) {
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
export default function BloqueAutorizacion({ entrada }: { entrada: Entrada; onCambio?: () => void }) {
  const { perfil, esEditor } = useAuth();
  const [mias, setMias] = useState<Autorizacion[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [subir, setSubir] = useState(false);
  const [verEntregas, setVerEntregas] = useState(false);
  const [editando, setEditando] = useState<Autorizacion | null>(null);

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

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-kanot-pink/25 bg-kanot-pink/[0.07] p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <FileText size={16} className="text-kanot-pink" /> Autorización firmada
      </p>
      <p className="-mt-1 text-xs text-white/55">Descarga la autorización oficial en Documentos, fírmala y súbela aquí.</p>

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
              <button type="button" onClick={() => setEditando(a)} aria-label="Cambiar nombre" className="p-1 text-white/55 hover:text-white">
                <Pencil size={15} />
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
      {editando && (
        <EditarAutorizacion
          autorizacion={editando}
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

function SubirAutorizacion({
  entrada,
  onCerrar,
  onSubida,
  miembros,
  para,
}: {
  entrada: Entrada;
  onCerrar: () => void;
  onSubida: () => void;
  /** Solo editores/admins: pueden subirla en nombre de otra cuenta. */
  miembros?: Miembro[];
  para?: Miembro | null;
}) {
  const { perfil } = useAuth();
  const [cuenta, setCuenta] = useState(para?.id ?? "");
  const [bailarin, setBailarin] = useState(para?.nombre ?? "");
  const [grupo, setGrupo] = useState(para?.grupo ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!perfil || !archivo) return;
    setEnviando(true);
    setError(null);
    const supabase = getSupabase();
    // Si es una foto, se reduce pero con calidad alta para que se lea bien la firma.
    const fichero = await comprimirImagen(archivo, { maxLado: 2200, calidad: 0.9 });
    // La autorización cuenta para la cuenta elegida (o para quien la sube).
    const duenio = cuenta || perfil.id;
    const ruta = `${entrada.id}/${duenio}/${Date.now()}-${limpiar(fichero.name)}`;
    const { error: e1 } = await supabase.storage
      .from("autorizaciones")
      .upload(ruta, fichero, { contentType: fichero.type || undefined });
    if (e1) {
      setError(
        /bucket not found/i.test(e1.message)
          ? "Falta activar las autorizaciones (SQL 006)."
          : /row-level security/i.test(e1.message)
            ? "Falta activar el SQL 018 para subirla por otra persona."
            : e1.message,
      );
      setEnviando(false);
      return;
    }
    const { error: e2 } = await supabase.from("autorizaciones").insert({
      entrada_id: entrada.id,
      user_id: duenio,
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
        {miembros && (
          <Etiqueta texto="¿De quién es? (cuenta de la app)">
            <Select
              value={cuenta}
              onChange={(e) => {
                const m = miembros.find((x) => x.id === e.target.value);
                setCuenta(e.target.value);
                if (m) {
                  setBailarin(m.nombre ?? "");
                  setGrupo(m.grupo ?? "");
                }
              }}
            >
              <option value="">Nadie en concreto (la subo yo)</option>
              {miembros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre ?? m.email}
                  {m.grupo ? ` · ${m.grupo}` : ""}
                </option>
              ))}
            </Select>
          </Etiqueta>
        )}
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

/** Cambiar el nombre o el grupo de una autorización ya subida. */
function EditarAutorizacion({
  autorizacion,
  onCerrar,
  onGuardada,
}: {
  autorizacion: Autorizacion;
  onCerrar: () => void;
  onGuardada: () => void;
}) {
  const [bailarin, setBailarin] = useState(autorizacion.bailarin);
  const [grupo, setGrupo] = useState(autorizacion.grupo ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const { data, error } = await getSupabase()
      .from("autorizaciones")
      .update({ bailarin: bailarin.trim(), grupo: grupo || null })
      .eq("id", autorizacion.id)
      .select("id");
    setGuardando(false);
    if (error) return setError(error.message);
    if (!data?.length) return setError("Falta activar el SQL 018 para poder cambiar nombres.");
    onGuardada();
  }

  return (
    <Modal titulo="Cambiar autorización" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Etiqueta texto="Nombre y apellidos del bailarín/a">
          <Input value={bailarin} onChange={(e) => setBailarin(e.target.value)} required autoFocus />
        </Etiqueta>
        <Etiqueta texto="Grupo">
          <Select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
            <option value="">Sin grupo</option>
            {GRUPOS_BAILE.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Etiqueta>
        {error && <Aviso>{error}</Aviso>}
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </Boton>
      </form>
    </Modal>
  );
}

type Miembro = { id: string; nombre: string | null; email: string | null; grupo: string | null };

/** Entregas para editores/admins: por grupo, quién la ha entregado y quién falta. */
function Entregas({ entrada, onCerrar, onCambio }: { entrada: Entrada; onCerrar: () => void; onCambio: () => void }) {
  const [lista, setLista] = useState<Autorizacion[] | null>(null);
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [avisoMiembros, setAvisoMiembros] = useState<string | null>(null);
  const [notificando, setNotificando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [subirPara, setSubirPara] = useState<Miembro | null | undefined>(undefined);
  const [editando, setEditando] = useState<Autorizacion | null>(null);

  const cargar = useCallback(async () => {
    const supabase = getSupabase();
    const [{ data }, crew] = await Promise.all([
      supabase.from("autorizaciones").select("*").eq("entrada_id", entrada.id).order("bailarin"),
      supabase.rpc("crew_miembros"),
    ]);
    setLista((data ?? []) as Autorizacion[]);
    if (crew.error) setAvisoMiembros(/crew_miembros|schema cache/i.test(crew.error.message) ? "Falta activar el SQL 010 para ver quién falta." : crew.error.message);
    else setMiembros((crew.data ?? []) as Miembro[]);
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

  async function recordar() {
    setNotificando(true);
    setResultado(null);
    try {
      const r = await enviarNotificacion({
        titulo: `Autorización · ${entrada.titulo}`,
        cuerpo: "Si aún no la has subido, descárgala, fírmala y súbela en la app.",
        url: "/app/kanot-crew?tab=competicion",
        destino: "crew",
      });
      setResultado(`Recordatorio enviado a ${r.enviadas} ${r.enviadas === 1 ? "móvil" : "móviles"} de la crew.`);
    } catch (err) {
      setResultado(err instanceof Error ? err.message : String(err));
    }
    setNotificando(false);
  }

  // Una familia "ha entregado" si ha subido al menos una autorización para este campeonato.
  const entregaron = new Set((lista ?? []).map((a) => a.user_id));
  const grupos = [...GRUPOS_BAILE, "Sin grupo"].map((g) => ({
    grupo: g,
    items: (lista ?? []).filter((a) => (a.grupo ?? "Sin grupo") === g),
    faltan: miembros.filter((m) => (m.grupo ?? "Sin grupo") === g && !entregaron.has(m.id)),
  }));
  const totalFaltan = grupos.reduce((n, g) => n + g.faltan.length, 0);

  return (
    <Modal titulo={`Entregas · ${entrada.titulo}`} onCerrar={onCerrar}>
      {!lista ? (
        <p className="text-sm text-white/60">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-center">
              <p className="text-2xl font-black text-emerald-300">{lista.length}</p>
              <p className="text-xs text-white/60">entregadas</p>
            </div>
            <div className="rounded-2xl bg-red-500/10 p-3 text-center">
              <p className="text-2xl font-black text-red-200">{avisoMiembros ? "—" : totalFaltan}</p>
              <p className="text-xs text-white/60">faltan</p>
            </div>
          </div>
          {avisoMiembros && <p className="text-xs text-white/55">{avisoMiembros}</p>}

          {grupos
            .filter((g) => g.items.length || g.faltan.length)
            .map((g) => (
              <section key={g.grupo}>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-kanot-pink">
                  {g.grupo} · {g.items.length} entregadas{g.faltan.length ? ` · ${g.faltan.length} faltan` : ""}
                </h3>
                <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
                  {g.items.map((a) => (
                    <li key={a.id} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-300" />
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
                      <button type="button" onClick={() => setEditando(a)} aria-label="Cambiar nombre" className="p-1.5 text-white/45 hover:text-white">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => borrar(a)} aria-label="Borrar" className="p-1.5 text-white/45 hover:text-white">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                  {g.faltan.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/60">
                      <span className="h-4 w-4 shrink-0 rounded-full border-2 border-red-300/60" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-white/80">{m.nombre ?? m.email}</span>
                        <span className="block text-xs text-red-200/80">Falta por entregar</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubirPara(m)}
                        className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                      >
                        <Upload size={13} /> Subir
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

          {lista.length === 0 && !miembros.length && (
            <p className="text-sm text-white/60">Todavía nadie ha subido la autorización.</p>
          )}

          <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <Boton onClick={() => setSubirPara(null)}>
              <Upload size={16} /> Subir una autorización
            </Boton>
            <Boton variante="secundario" onClick={recordar} disabled={notificando}>
              <Bell size={16} /> {notificando ? "Enviando…" : "Enviar recordatorio a la crew"}
            </Boton>
            {resultado && <p className="text-center text-xs text-white/60">{resultado}</p>}
            <p className="text-center text-[11px] text-white/40">
              “Faltan” cuenta las cuentas de miembros sin ninguna autorización subida para este campeonato.
            </p>
          </div>
        </div>
      )}
      {subirPara !== undefined && (
        <SubirAutorizacion
          entrada={entrada}
          miembros={miembros}
          para={subirPara}
          onCerrar={() => setSubirPara(undefined)}
          onSubida={() => {
            setSubirPara(undefined);
            cargar();
            onCambio();
          }}
        />
      )}
      {editando && (
        <EditarAutorizacion
          autorizacion={editando}
          onCerrar={() => setEditando(null)}
          onGuardada={() => {
            setEditando(null);
            cargar();
            onCambio();
          }}
        />
      )}
    </Modal>
  );
}
