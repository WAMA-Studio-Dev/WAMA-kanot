"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { formaciones } from "@/app/data/formaciones";
import { edicionesOrdenadas, nombreEdicion } from "@/app/data/kodigoKlub";
import { podcastVideos } from "@/app/data/podcastVideos";
import { youtubeChannelUrl } from "@/app/data/podcast";
import { colorGrupo, type Entrada } from "./secciones";
import { useAuth } from "./AuthProvider";

/** Dónde lleva cada tipo de evento y cómo se llama. */
const DESTINO: Record<string, { nombre: string; href: string }> = {
  competicion: { nombre: "Competición", href: "/app/kanot-crew?tab=competicion" },
  formaciones: { nombre: "Formación", href: "/app/kanot-crew?tab=formaciones" },
  "kodigo-klub": { nombre: "Kodigo Klub", href: "/app/kodigo-klub?tab=entradas" },
  "kanot-kamp": { nombre: "Kanot Kamp", href: "/app/kanot-kamp?tab=inscribete" },
};

const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "20 de diciembre de 2026" → "2026-12-20" (las fechas tipo "Enero 2027" se ignoran). */
export function fechaWebAISO(texto: string) {
  const m = texto.toLowerCase().match(/(\d{1,2}) de ([a-záéíóú]+) de (\d{4})/);
  const mes = m ? MESES_LARGOS.indexOf(m[2]) + 1 : 0;
  if (!m || !mes) return null;
  return `${m[3]}-${String(mes).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** Formaciones de la web con fecha concreta, con la misma forma que las entradas de la app. */
function formacionesWeb(desde: string): Entrada[] {
  return formaciones.flatMap((f) => {
    const fecha = fechaWebAISO(f.fecha);
    if (f.finalizada || !fecha || fecha < desde) return [];
    return [{
      id: `web-${f.id}`, seccion: "formaciones", titulo: f.titulo, descripcion: null,
      fecha, hora: f.horario ?? null, dia_semana: null, lugar: f.ubicacion, enlace: null, orden: 0,
    }];
  });
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** "2026-11-22" → "domingo 22 nov" */
function diaLegible(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${DIAS_SEMANA[new Date(y, m - 1, d).getDay()]} ${d} ${MESES[m - 1]}`;
}

/** Lo que se pinta en "Lo próximo". Sin fecha = se muestra "Pronto" / "Nuevo". */
type Proximo = { id: string; titulo: string; fecha: string | null; etiqueta?: string; detalle: string; href: string };

const SECCIONES_CREW = ["competicion", "formaciones"];

function desdeEntrada(e: Entrada): Proximo {
  const destino = DESTINO[e.seccion];
  return {
    id: e.id,
    titulo: e.titulo,
    fecha: e.fecha,
    detalle: `${destino.nombre}${e.lugar ? ` · ${e.lugar}` : ""}`,
    href: destino.href,
  };
}

/** Relleno con contenido de la web para que siempre haya 3 cosas en "Lo próximo". */
function relleno(): Proximo[] {
  const items: Proximo[] = [];
  const proxima = [...edicionesOrdenadas].reverse().find((e) => !e.finalizada);
  if (proxima) {
    // Si la edición ya tiene fecha concreta ("13 de febrero de 2027"), sale con su día.
    const fecha = proxima.fecha ? fechaWebAISO(proxima.fecha) : null;
    items.push({
      id: "kodigo-edicion",
      titulo: `Kodigo Klub · ${nombreEdicion(proxima.numero)}`,
      fecha: fecha && fecha >= hoyISO() ? fecha : null,
      etiqueta: "Pronto",
      detalle: fecha ? "Entradas en efectivo y online muy pronto" : "Próximamente · fecha e invitadxs muy pronto",
      href: "/app/kodigo-klub?tab=ediciones",
    });
  }
  const episodio = podcastVideos.find((v) => v.url !== youtubeChannelUrl);
  if (episodio) {
    items.push({
      id: "podcast-ultimo",
      titulo: `Podcast · ${episodio.titulo}`,
      fecha: null,
      etiqueta: "Nuevo",
      detalle: "Último episodio del podcast",
      href: "/app/podcast",
    });
  }
  items.push({
    id: "merch",
    titulo: "Merch temporada 26/27",
    fecha: null,
    etiqueta: "Merch",
    detalle: "Camiseta, pantalón y pack · reserva por WhatsApp",
    href: "/app/merch",
  });
  return items;
}

type Datos = { fechaEnsayo: string | null; clases: Entrada[]; proximos: Proximo[] };

/**
 * Bloque "Esta semana" de Inicio: las clases de hoy (o del siguiente día con clase)
 * y los próximos eventos de competición, formaciones, Kodigo y Kamp. Si no hay nada, no se muestra.
 */
export default function EstaSemana() {
  const { esCrew } = useAuth();
  const [datos, setDatos] = useState<Datos | null>(null);

  useEffect(() => {
    let activo = true;
    const supabase = getSupabase();
    const hoy = hoyISO();
    // Quien no es de Kanot Crew solo ve eventos de Kodigo y Kamp (y no ve ensayos).
    const secciones = Object.keys(DESTINO).filter((s) => esCrew || !SECCIONES_CREW.includes(s));
    Promise.all([
      // Próximo día con ensayo (hoy incluido): basta con traer los siguientes y quedarse con la primera fecha.
      esCrew
        ? supabase.from("entradas").select("*").eq("seccion", "horarios").gte("fecha", hoy).order("fecha").limit(20)
        : Promise.resolve({ data: [] }),
      supabase.from("entradas").select("*").in("seccion", secciones).gte("fecha", hoy).order("fecha").limit(3),
    ]).then(([horarios, eventos]) => {
      if (!activo) return;
      const ensayos = (horarios.data ?? []) as Entrada[];
      const fechaEnsayo = ensayos[0]?.fecha ?? null;
      const clases = ensayos
        .filter((c) => c.fecha === fechaEnsayo)
        .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
      const conFecha = [...((eventos.data ?? []) as Entrada[]), ...(esCrew ? formacionesWeb(hoy) : [])]
        .sort((a, b) => a.fecha!.localeCompare(b.fecha!))
        .map(desdeEntrada);
      const proximos = [...conFecha, ...relleno()].slice(0, 3);
      setDatos({ fechaEnsayo, clases, proximos });
    });
    return () => {
      activo = false;
    };
  }, [esCrew]);

  if (!datos || (datos.clases.length === 0 && datos.proximos.length === 0)) return null;

  const esHoy = datos.fechaEnsayo === hoyISO();

  return (
    <div className="flex flex-col gap-8">
      {datos.clases.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-2xl font-black tracking-tight">
              {esHoy ? "Hoy" : "Próximo ensayo"}
              <span className="ml-2 text-base font-medium text-white/45">
                {datos.fechaEnsayo && diaLegible(datos.fechaEnsayo)}
              </span>
            </h2>
            <Link href="/app/kanot-crew?tab=horarios" className="text-sm font-semibold text-kanot-pink">
              Horario
            </Link>
          </div>
          <ul className="flex flex-col">
            {datos.clases.map((c) => (
              <li key={c.id} className="flex items-center gap-4 border-t border-white/10 py-3 first:border-t-0">
                <span className="w-28 shrink-0 text-sm font-bold tabular-nums text-kanot-pink">{c.hora ?? "—"}</span>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorGrupo(c.titulo) }} />
                <span className="min-w-0">
                  <span className="block font-semibold leading-snug">{c.titulo}</span>
                  {c.lugar && <span className="block text-sm text-white/55">{c.lugar}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {datos.proximos.length > 0 && (
        <section>
          <h2 className="mb-3 text-2xl font-black tracking-tight">Lo próximo</h2>
          <ul className="flex flex-col gap-2">
            {datos.proximos.map((e) => {
              const [, m, d] = e.fecha ? e.fecha.split("-").map(Number) : [0, 0, 0];
              return (
                <li key={e.id}>
                  <Link
                    href={e.href}
                    className="flex items-center gap-4 rounded-2xl bg-white/[0.04] p-3 transition hover:bg-white/[0.08]"
                  >
                    {e.fecha ? (
                      <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-kanot-pink py-1.5 text-kanot-navy-deep">
                        <span className="text-2xl font-black leading-none">{d}</span>
                        <span className="text-[11px] font-bold">{MESES[m - 1]}</span>
                      </span>
                    ) : (
                      <span className="flex h-[52px] w-14 shrink-0 items-center justify-center rounded-xl border border-kanot-pink/50 text-[11px] font-bold uppercase text-kanot-pink">
                        {e.etiqueta ?? "Pronto"}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{e.titulo}</span>
                      <span className="block truncate text-sm text-white/55">{e.detalle}</span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-white/30" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
