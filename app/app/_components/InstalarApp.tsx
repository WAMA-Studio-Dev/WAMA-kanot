"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Boton, Modal } from "./ui";

type EventoInstalar = Event & { prompt: () => Promise<void> };

const CLAVE = "kanot-instalar-oculto";

/** Aviso para añadir la app a la pantalla de inicio (Android: botón; iPhone: instrucciones). */
export default function InstalarApp() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [esIOS, setEsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const instalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let oculto = false;
    try {
      oculto = localStorage.getItem(CLAVE) === "1";
    } catch {}
    if (instalada || oculto) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende de APIs del navegador
    setEsIOS(ios);
    if (ios) setVisible(true);

    const alPedir = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", alPedir);
    return () => window.removeEventListener("beforeinstallprompt", alPedir);
  }, []);

  if (!visible) return null;

  function ocultar() {
    setVisible(false);
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {}
  }

  return (
    <div id="instalar" className="relative flex scroll-mt-24 items-start gap-3 rounded-3xl border border-kanot-pink/30 bg-kanot-pink/10 p-4 pr-10">
      <Download className="mt-0.5 shrink-0 text-kanot-pink" size={20} />
      <div className="flex-1 text-sm">
        <p className="font-semibold">Instala la app en tu móvil</p>
        {esIOS ? (
          <p className="mt-1 text-white/70">
            Pulsa <Share size={14} className="inline -translate-y-0.5" /> <b>Compartir</b> en Safari y luego{" "}
            <b>“Añadir a pantalla de inicio”</b>.
          </p>
        ) : (
          <Boton
            className="mt-3"
            onClick={async () => {
              await evento?.prompt();
              ocultar();
            }}
          >
            Instalar
          </Boton>
        )}
      </div>
      <button
        type="button"
        onClick={ocultar}
        aria-label="No mostrar más"
        className="absolute right-3 top-3 rounded-full p-1 text-white/50 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
  );
}

type Plataforma = "ios" | "android" | "ordenador";

/**
 * Botón "Descargar la app" (pantalla de entrada). En Android abre el instalador del navegador
 * si está disponible; si no, y en iPhone u ordenador, explica los pasos. No aparece si ya está instalada.
 */
export function BotonDescargar({ className = "" }: { className?: string }) {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);
  const [ayuda, setAyuda] = useState(false);

  useEffect(() => {
    const instalada =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (instalada) return;

    const ua = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende de APIs del navegador
    setPlataforma(
      /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
        ? "ios"
        : /android/i.test(ua)
          ? "android"
          : "ordenador",
    );

    const alPedir = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    window.addEventListener("beforeinstallprompt", alPedir);
    return () => window.removeEventListener("beforeinstallprompt", alPedir);
  }, []);

  if (!plataforma) return null;

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (evento) {
            await evento.prompt();
            setEvento(null);
          } else {
            setAyuda(true);
          }
        }}
        className={`flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-kanot-pink hover:text-kanot-pink ${className}`}
      >
        <Download size={17} /> Descargar la app
      </button>

      {ayuda && (
        <Modal titulo="Descargar ByKanot" onCerrar={() => setAyuda(false)}>
          <PasosInstalar plataforma={plataforma} />
          <Boton className="mt-6 w-full" onClick={() => setAyuda(false)}>
            Entendido
          </Boton>
        </Modal>
      )}
    </>
  );
}

function PasosInstalar({ plataforma }: { plataforma: Plataforma }) {
  if (plataforma === "ordenador") {
    return (
      <div className="flex flex-col gap-3 text-sm text-white/80">
        <p>La app está pensada para el móvil. Abre esta misma página en tu teléfono y pulsa “Descargar la app”:</p>
        <p className="break-all rounded-xl bg-white/5 px-4 py-3 font-mono text-kanot-pink">
          {typeof window !== "undefined" ? `${window.location.origin}/app` : "/app"}
        </p>
        <p className="text-white/55">No hace falta App Store ni Google Play: se instala desde el navegador.</p>
      </div>
    );
  }

  const pasos =
    plataforma === "ios"
      ? [
          <>Abre esta página en <b>Safari</b>.</>,
          <>
            Pulsa el botón <b>Compartir</b> <Share size={15} className="inline -translate-y-0.5 text-kanot-pink" /> (abajo
            en el centro).
          </>,
          <>Baja y elige <b>“Añadir a pantalla de inicio”</b>.</>,
          <>Pulsa <b>Añadir</b>. Ya tienes ByKanot en tu pantalla de inicio.</>,
        ]
      : [
          <>Abre esta página en <b>Chrome</b>.</>,
          <>Pulsa el menú <b>⋮</b> (arriba a la derecha).</>,
          <>Elige <b>“Instalar aplicación”</b> o <b>“Añadir a pantalla de inicio”</b>.</>,
          <>Confirma. Ya tienes ByKanot en tu pantalla de inicio.</>,
        ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-white/65">Sin App Store ni Google Play: se instala desde el navegador en un momento.</p>
      <ol className="flex flex-col gap-3">
        {pasos.map((p, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-white/85">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kanot-pink text-xs font-bold text-kanot-navy-deep">
              {i + 1}
            </span>
            <span className="pt-1">{p}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
