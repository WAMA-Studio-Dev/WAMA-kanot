"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { GRUPOS, colorGrupo, type Entrada } from "./secciones";

const CLAVE_FILTRO = "kanot-filtro-grupo";
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function hoyLocalISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Dia = { fecha: string; sesiones: Entrada[] };
type Mes = { clave: string; titulo: string; dias: Dia[] };

/** Agrupa por mes y día, ordenado por fecha y hora. */
function agrupar(entradas: Entrada[], descendente: boolean): Mes[] {
  const porDia = new Map<string, Entrada[]>();
  for (const e of entradas) porDia.set(e.fecha!, [...(porDia.get(e.fecha!) ?? []), e]);
  const dias = [...porDia.entries()]
    .sort(([a], [b]) => (descendente ? b.localeCompare(a) : a.localeCompare(b)))
    .map(([fecha, sesiones]) => ({
      fecha,
      sesiones: sesiones.sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? "")),
    }));
  const meses: Mes[] = [];
  for (const d of dias) {
    const [y, m] = d.fecha.split("-").map(Number);
    const clave = `${y}-${m}`;
    let mes = meses.find((x) => x.clave === clave);
    if (!mes) {
      mes = { clave, titulo: `${MESES[m - 1]} ${String(y).slice(2)}`, dias: [] };
      meses.push(mes);
    }
    mes.dias.push(d);
  }
  return meses;
}

/** Horarios de ensayo por fechas, con filtro por grupo (se recuerda en el móvil). */
export default function VistaCalendario({
  entradas,
  acciones,
}: {
  entradas: Entrada[];
  acciones?: (e: Entrada) => ReactNode;
}) {
  const [grupo, setGrupo] = useState<string | null>(null);
  const [verPasados, setVerPasados] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada en el navegador
      setGrupo(localStorage.getItem(CLAVE_FILTRO));
    } catch {}
  }, []);

  function elegir(g: string | null) {
    setGrupo(g);
    try {
      if (g) localStorage.setItem(CLAVE_FILTRO, g);
      else localStorage.removeItem(CLAVE_FILTRO);
    } catch {}
  }

  const { proximos, pasados, sinFecha } = useMemo(() => {
    const hoy = hoyLocalISO();
    // "Todos juntos" aparece siempre, sea cual sea el grupo elegido.
    const visibles = entradas.filter(
      (e) =>
        !grupo ||
        e.titulo.toLowerCase().includes(grupo.toLowerCase()) ||
        e.titulo.toLowerCase().includes("todos"),
    );
    return {
      proximos: agrupar(visibles.filter((e) => e.fecha && e.fecha >= hoy), false),
      pasados: agrupar(visibles.filter((e) => e.fecha && e.fecha < hoy), true),
      sinFecha: visibles.filter((e) => !e.fecha),
    };
  }, [entradas, grupo]);

  return (
    <div className="flex flex-col gap-6">
      {/* Filtro por grupo */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip activo={!grupo} onClick={() => elegir(null)}>
          Todos
        </Chip>
        {GRUPOS.filter((g) => g.nombre !== "Todos juntos").map((g) => (
          <Chip key={g.nombre} activo={grupo === g.nombre} color={g.color} onClick={() => elegir(g.nombre)}>
            {g.nombre}
          </Chip>
        ))}
      </div>

      {proximos.length === 0 ? (
        <p className="text-white/55">No hay ensayos próximos{grupo ? ` para ${grupo}` : ""}.</p>
      ) : (
        <Meses meses={proximos} acciones={acciones} />
      )}

      {sinFecha.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-black">Sin fecha</h2>
          <ul>
            {sinFecha.map((e) => (
              <Sesion key={e.id} e={e} acciones={acciones} />
            ))}
          </ul>
        </section>
      )}

      {pasados.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setVerPasados((v) => !v)}
            className="text-sm font-semibold text-white/60 hover:text-kanot-pink"
          >
            {verPasados ? "Ocultar" : "Ver"} ensayos anteriores
          </button>
          {verPasados && (
            <div className="mt-4 opacity-70">
              <Meses meses={pasados} acciones={acciones} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Meses({ meses, acciones }: { meses: Mes[]; acciones?: (e: Entrada) => ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      {meses.map((mes) => (
        <section key={mes.clave}>
          <h2 className="mb-3 text-3xl font-black uppercase tracking-tight">{mes.titulo}</h2>
          <div className="flex flex-col gap-3">
            {mes.dias.map((d) => {
              const [y, m, dia] = d.fecha.split("-").map(Number);
              const semana = DIAS_CORTOS[new Date(y, m - 1, dia).getDay()];
              return (
                <div key={d.fecha} className="flex gap-3">
                  <div className="flex w-14 shrink-0 flex-col items-center pt-1">
                    <span className="text-xs font-semibold uppercase text-white/50">{semana}</span>
                    <span className="text-3xl font-black leading-none">{dia}</span>
                  </div>
                  <ul className="min-w-0 flex-1 rounded-2xl bg-white/[0.04] px-4">
                    {d.sesiones.map((e) => (
                      <Sesion key={e.id} e={e} acciones={acciones} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function Sesion({ e, acciones }: { e: Entrada; acciones?: (e: Entrada) => ReactNode }) {
  return (
    <li className="flex items-start gap-3 border-t border-white/10 py-3 first:border-t-0">
      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorGrupo(e.titulo) }} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{e.titulo}</p>
        <p className="text-sm tabular-nums text-white/65">{e.hora ?? "Hora por confirmar"}</p>
        {e.lugar && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
            <MapPin size={12} /> {e.lugar}
          </p>
        )}
        {e.descripcion && <p className="mt-1 whitespace-pre-line text-xs text-white/55">{e.descripcion}</p>}
      </div>
      {acciones?.(e)}
    </li>
  );
}

function Chip({
  activo,
  color,
  onClick,
  children,
}: {
  activo: boolean;
  color?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        activo ? "border-white bg-white text-kanot-navy-deep" : "border-white/20 text-white/75 hover:border-white/50"
      }`}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </button>
  );
}
