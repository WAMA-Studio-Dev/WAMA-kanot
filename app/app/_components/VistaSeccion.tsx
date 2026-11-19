"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, ExternalLink, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { DIAS, getSeccion, type Entrada, type Seccion } from "./secciones";
import { Aviso, Boton, Cargando } from "./ui";
import FormEntrada from "./FormEntrada";
import VistaCalendario from "./VistaCalendario";
import BloqueAutorizacion from "./BloqueAutorizacion";
import BloqueInscripcion from "./BloqueInscripcion";
import DocumentosCompeticion from "./DocumentosCompeticion";
import ProgramaCompeticion from "./ProgramaCompeticion";
import ResultadosCompeticion from "./ResultadosCompeticion";

export default function VistaSeccion({
  slug,
  compacto = false,
  ocultarVacio = false,
}: {
  slug: string;
  /** Sin cabecera (para usar dentro de una página con pestañas). */
  compacto?: boolean;
  /** No muestra el aviso de "Todavía no hay nada" (cuando la página ya tiene otro contenido). */
  ocultarVacio?: boolean;
}) {
  const seccion = getSeccion(slug)!;
  const { esEditor } = useAuth();
  const [entradas, setEntradas] = useState<Entrada[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Entrada | "nueva" | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("entradas")
      .select("*")
      .eq("seccion", slug)
      .order("orden")
      .order("created_at");
    if (error) setError(error.message);
    else setEntradas(data as Entrada[]);
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    cargar();
  }, [cargar]);

  // Nada que mostrar ni botón "Añadir": no ocupa espacio.
  if (ocultarVacio && !esEditor && entradas?.length === 0) return null;

  async function borrar(e: Entrada) {
    if (!confirm(`¿Borrar “${e.titulo}”? No se puede deshacer.`)) return;
    const { error } = await getSupabase().from("entradas").delete().eq("id", e.id);
    if (error) alert(error.message);
    else cargar();
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`flex items-start gap-4 ${compacto ? "justify-end" : "justify-between"} ${compacto && !esEditor ? "hidden" : ""}`}
      >
        <div className={`flex items-center gap-3 ${compacto ? "hidden" : ""}`}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
            <seccion.icono size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{seccion.nombre}</h1>
            <p className="text-sm text-white/55">{seccion.descripcion}</p>
          </div>
        </div>
        {esEditor && (
          <Boton onClick={() => setEditando("nueva")} className="shrink-0 px-4" aria-label="Añadir">
            <Plus size={18} /> <span className="hidden sm:inline">Añadir</span>
          </Boton>
        )}
      </div>

      {error && <Aviso>{error}</Aviso>}
      {!entradas && !error && <Cargando />}

      {entradas && entradas.length === 0 && !ocultarVacio && (
        <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/55">
          Todavía no hay nada publicado aquí.
          {esEditor && <p className="mt-1 text-sm">Pulsa “Añadir” para crear la primera entrada.</p>}
        </div>
      )}

      {entradas && entradas.length > 0 && (
        <Listado
          seccion={seccion}
          entradas={entradas}
          recargar={cargar}
          acciones={
            esEditor
              ? (e) => (
                  <div className="flex gap-1">
                    <BotonIcono etiqueta="Editar" onClick={() => setEditando(e)}>
                      <Pencil size={16} />
                    </BotonIcono>
                    <BotonIcono etiqueta="Borrar" onClick={() => borrar(e)}>
                      <Trash2 size={16} />
                    </BotonIcono>
                  </div>
                )
              : undefined
          }
        />
      )}

      {editando && (
        <FormEntrada
          seccion={seccion}
          entrada={editando === "nueva" ? null : editando}
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

type Acciones = ((e: Entrada) => React.ReactNode) | undefined;

function Listado({
  seccion,
  entradas,
  acciones,
  recargar,
}: {
  seccion: Seccion;
  entradas: Entrada[];
  acciones: Acciones;
  recargar: () => void;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [verPasados, setVerPasados] = useState(false);

  const grupos = useMemo(() => {
    if (seccion.vista === "semana") {
      const porDia = new Map<number, Entrada[]>();
      for (const e of entradas) {
        const d = e.dia_semana ?? 8;
        porDia.set(d, [...(porDia.get(d) ?? []), e]);
      }
      return [...porDia.entries()]
        .sort(([a], [b]) => a - b)
        .map(([d, lista]) => ({
          titulo: DIAS[d - 1] ?? "Sin día",
          lista: lista.sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? "")),
        }));
    }
    return [];
  }, [entradas, seccion.vista]);

  if (seccion.vista === "calendario") return <VistaCalendario entradas={entradas} acciones={acciones} />;

  if (seccion.vista === "semana") {
    return (
      <div className="flex flex-col gap-6">
        {grupos.map((g) => (
          <section key={g.titulo}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-kanot-pink">{g.titulo}</h2>
            <div className="flex flex-col gap-3">
              {g.lista.map((e) => (
                <TarjetaEntrada
                  key={e.id}
                  entrada={e}
                  acciones={acciones}
                  textoEnlace={seccion.textoEnlace}
                  pie={seccion.slug === "competicion" ? <ResultadosCompeticion entrada={e} onCambio={recargar} /> : undefined}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (seccion.vista === "texto") {
    return (
      <div className="flex flex-col gap-3">
        {entradas.map((e) => (
          <TarjetaEntrada key={e.id} entrada={e} acciones={acciones} textoEnlace={seccion.textoEnlace} />
        ))}
      </div>
    );
  }

  if (seccion.vista === "personas") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {entradas.map((e) => (
          <article key={e.id} className="flex gap-4 rounded-3xl border border-white/10 bg-black/25 p-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-kanot-pink/20 text-xl font-bold text-kanot-pink">
              {e.titulo.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{e.titulo}</h3>
                {acciones?.(e)}
              </div>
              {e.descripcion && (
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-white/75">{e.descripcion}</p>
              )}
              {e.enlace && (
                <a
                  href={e.enlace}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-kanot-pink hover:underline"
                >
                  {seccion.textoEnlace ?? "Abrir enlace"} <ExternalLink size={14} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  }

  const esPodcast = seccion.slug === "podcast";
  const proximos = entradas
    .filter((e) => esPodcast || !e.fecha || e.fecha >= hoy)
    .sort((a, b) =>
      esPodcast ? (b.fecha ?? "").localeCompare(a.fecha ?? "") : (a.fecha ?? "9999").localeCompare(b.fecha ?? "9999"),
    );
  const pasados = esPodcast
    ? []
    : entradas.filter((e) => e.fecha && e.fecha < hoy).sort((a, b) => b.fecha!.localeCompare(a.fecha!));

  return (
    <div className="flex flex-col gap-6">
      {proximos.length > 0 ? (
        <div className={esPodcast ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-3"}>
          {proximos.map((e) => (
            <TarjetaEntrada
              key={e.id}
              entrada={e}
              acciones={acciones}
              textoEnlace={seccion.textoEnlace}
              video={esPodcast}
              cuentaAtras={seccion.slug === "competicion"}
              pie={
                seccion.autorizaciones && e.fecha ? (
                  <>
                    <ResultadosCompeticion entrada={e} onCambio={recargar} />
                    <ProgramaCompeticion entrada={e} onCambio={recargar} />
                    <DocumentosCompeticion entrada={e} />
                    <BloqueInscripcion entrada={e} onCambio={recargar} />
                    <BloqueAutorizacion entrada={e} onCambio={recargar} />
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-white/55">No hay nada próximamente.</p>
      )}

      {pasados.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setVerPasados((v) => !v)}
            className="text-sm font-semibold text-white/60 hover:text-kanot-pink"
          >
            {verPasados ? "Ocultar" : "Ver"} anteriores ({pasados.length})
          </button>
          {verPasados && (
            <div className="mt-3 flex flex-col gap-3 opacity-75">
              {pasados.map((e) => (
                <TarjetaEntrada key={e.id} entrada={e} acciones={acciones} textoEnlace={seccion.textoEnlace} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function TarjetaEntrada({
  entrada: e,
  acciones,
  video,
  textoEnlace = "Abrir enlace",
  pie,
  cuentaAtras,
}: {
  entrada: Entrada;
  acciones: Acciones;
  video?: boolean;
  textoEnlace?: string;
  /** Contenido extra al final de la tarjeta (p. ej. autorizaciones). */
  pie?: React.ReactNode;
  /** Mostrar "Faltan X días" al lado de la fecha (campeonatos). */
  cuentaAtras?: boolean;
}) {
  const youtubeId = video && e.enlace ? idYoutube(e.enlace) : null;

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
      {youtubeId && (
        <a href={e.enlace!} target="_blank" rel="noreferrer" className="block aspect-video bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element -- miniatura externa de YouTube */}
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </a>
      )}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug">{e.titulo}</h3>
          {acciones?.(e)}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/70">
          {e.fecha && (
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} className="text-kanot-pink" /> {formatearFecha(e.fecha)}
              {cuentaAtras && <CuentaAtras fecha={e.fecha} />}
            </span>
          )}
          {e.hora && (
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-kanot-pink" /> {e.hora}
            </span>
          )}
          {e.lugar && (
            <span className="flex items-center gap-1.5">
              <MapPin size={15} className="text-kanot-pink" /> {e.lugar}
            </span>
          )}
        </div>

        {e.descripcion && <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">{e.descripcion}</p>}

        {e.enlace && !youtubeId && (
          <a
            href={e.enlace}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-kanot-pink hover:underline"
          >
            {textoEnlace} <ExternalLink size={14} />
          </a>
        )}
        {pie}
      </div>
    </article>
  );
}

function BotonIcono({ etiqueta, onClick, children }: { etiqueta: string; onClick: () => void; children: React.ReactNode }) {
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

function formatearFecha(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function idYoutube(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

/** Pastilla pequeña con los días que faltan: "Hoy", "Mañana", "Faltan 12 días". */
function CuentaAtras({ fecha }: { fecha: string }) {
  const [y, m, d] = fecha.split("-").map(Number);
  const hoy = new Date();
  const dias = Math.round(
    (new Date(y, m - 1, d).getTime() - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()) / 86400000,
  );
  if (dias < 0) return null;
  const texto = dias === 0 ? "¡Hoy!" : dias === 1 ? "Mañana" : `Faltan ${dias} días`;
  return (
    <span
      className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
        dias <= 7 ? "bg-kanot-pink text-kanot-navy-deep" : "bg-kanot-pink/15 text-kanot-pink"
      }`}
    >
      {texto}
    </span>
  );
}
