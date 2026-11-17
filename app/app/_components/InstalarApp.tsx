"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Boton } from "./ui";

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
    <div className="relative flex items-start gap-3 rounded-3xl border border-kanot-pink/30 bg-kanot-pink/10 p-4 pr-10">
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
