"use client";

import { useEffect, useState } from "react";
import { Moon, Smartphone, Sun } from "lucide-react";
import { guardarTema, leerTema, type Tema } from "./tema";

const OPCIONES: { valor: Tema; nombre: string; icono: typeof Sun }[] = [
  { valor: "oscuro", nombre: "Oscuro", icono: Moon },
  { valor: "claro", nombre: "Claro", icono: Sun },
  { valor: "auto", nombre: "Como el móvil", icono: Smartphone },
];

/** Perfil → Apariencia: modo oscuro, claro o automático (se guarda en este móvil). */
export default function SelectorTema() {
  const [tema, setTema] = useState<Tema>("oscuro");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada en el móvil
    setTema(leerTema());
  }, []);

  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">Apariencia</h2>
      <div className="grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/5 p-1">
        {OPCIONES.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => {
              setTema(o.valor);
              guardarTema(o.valor);
            }}
            aria-pressed={tema === o.valor}
            className={`flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-bold transition ${
              tema === o.valor ? "bg-kanot-pink text-kanot-navy-deep" : "text-white/65 hover:text-white"
            }`}
          >
            <o.icono size={14} /> {o.nombre}
          </button>
        ))}
      </div>
    </section>
  );
}
