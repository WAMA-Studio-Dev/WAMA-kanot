"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import {
  TIPOS_NOTI,
  guardarMisNotis,
  activarNotificaciones,
  desactivarNotificaciones,
  estadoNotificaciones,
  type EstadoNotificaciones,
} from "./notificaciones";
import { Boton } from "./ui";

const CLAVE_OCULTO = "kanot-aviso-notis-oculto";

function useEstado() {
  const [estado, setEstado] = useState<EstadoNotificaciones | null>(null);
  useEffect(() => {
    estadoNotificaciones()
      .then(setEstado)
      .catch(() => setEstado("no-disponible"));
  }, []);
  return [estado, setEstado] as const;
}

/** Perfil: activar o desactivar las notificaciones en este móvil. */
export default function ActivarNotificaciones() {
  const [estado, setEstado] = useEstado();
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!estado || estado === "no-disponible") return null;

  async function cambiar() {
    setTrabajando(true);
    setError(null);
    try {
      if (estado === "activas") {
        await desactivarNotificaciones();
        setEstado("inactivas");
      } else {
        await activarNotificaciones();
        setEstado("activas");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setTrabajando(false);
  }

  return (
    <section id="notificaciones" className="flex scroll-mt-24 flex-col gap-2 rounded-3xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center gap-3">
        {estado === "activas" ? <Bell className="text-kanot-pink" size={20} /> : <BellOff className="text-white/50" size={20} />}
        <div className="flex-1">
          <p className="font-semibold">Notificaciones</p>
          <p className="text-xs text-white/55">
            {estado === "activas" && "Activadas en este móvil."}
            {estado === "inactivas" && "Recibe los avisos de Kanot en tu móvil."}
            {estado === "bloqueadas" && "Las bloqueaste. Actívalas en los ajustes del móvil para esta app."}
            {estado === "solo-instalada" && "En iPhone, instala primero la app en la pantalla de inicio."}
          </p>
        </div>
        {(estado === "activas" || estado === "inactivas") && (
          <Boton variante={estado === "activas" ? "secundario" : "primario"} onClick={cambiar} disabled={trabajando} className="px-4">
            {trabajando ? "…" : estado === "activas" ? "Desactivar" : "Activar"}
          </Boton>
        )}
      </div>
      {error && <p className="text-xs text-red-200">{error}</p>}
      {estado === "activas" && <PreferenciasNotis />}
    </section>
  );
}

/** Lista de tipos de notificación que la persona puede quitar o volver a activar. */
function PreferenciasNotis() {
  const { perfil, esCrew, recargarPerfil } = useAuth();
  const [off, setOff] = useState<string[]>(perfil?.notis_off ?? []);
  const [error, setError] = useState<string | null>(null);
  const tipos = TIPOS_NOTI.filter((t) => esCrew || !t.soloCrew);

  async function cambiar(id: string) {
    const nuevo = off.includes(id) ? off.filter((x) => x !== id) : [...off, id];
    setOff(nuevo);
    setError(null);
    try {
      await guardarMisNotis(nuevo);
      recargarPerfil();
    } catch (err) {
      setOff(off);
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="mt-2 border-t border-white/10 pt-3">
      <p className="mb-2 text-xs font-semibold text-white/55">Qué quieres recibir</p>
      <ul className="flex flex-col">
        {tipos.map((t) => {
          const activo = !off.includes(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                role="switch"
                aria-checked={activo}
                onClick={() => cambiar(t.id)}
                className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm"
              >
                <span className={activo ? "" : "text-white/45"}>{t.nombre}</span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${activo ? "bg-kanot-pink" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${activo ? "left-[22px]" : "left-0.5"}`}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-1 text-xs text-red-200">{error}</p>}
    </div>
  );
}

/** Inicio: invitación a activar las notificaciones (se puede ocultar). */
export function InvitarNotificaciones() {
  const [estado, setEstado] = useEstado();
  const [oculto, setOculto] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada en el navegador
      setOculto(localStorage.getItem(CLAVE_OCULTO) === "1");
    } catch {
      setOculto(false);
    }
  }, []);

  if (oculto || estado !== "inactivas") return null;

  function ocultar() {
    setOculto(true);
    try {
      localStorage.setItem(CLAVE_OCULTO, "1");
    } catch {}
  }

  return (
    <div className="relative flex items-start gap-3 rounded-3xl border border-kanot-pink/30 bg-kanot-pink/10 p-4 pr-10">
      <Bell className="mt-0.5 shrink-0 text-kanot-pink" size={20} />
      <div className="flex-1 text-sm">
        <p className="font-semibold">Activa las notificaciones</p>
        <p className="mt-0.5 text-white/65">Te avisamos de ensayos, competiciones y novedades.</p>
        <Boton
          className="mt-3"
          onClick={async () => {
            try {
              await activarNotificaciones();
              setEstado("activas");
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          Activar
        </Boton>
        {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
      </div>
      <button type="button" onClick={ocultar} aria-label="No mostrar más" className="absolute right-3 top-3 rounded-full p-1 text-white/50 hover:text-white">
        <X size={18} />
      </button>
    </div>
  );
}
