"use client";

import { useState } from "react";
import FormacionCard from "@/app/components/formaciones/FormacionCard";
import { formaciones } from "@/app/data/formaciones";
import VistaSeccion from "./VistaSeccion";

const PROXIMAS = formaciones.filter((f) => !f.finalizada);
const REALIZADAS = formaciones.filter((f) => f.finalizada);

/**
 * Formaciones de la web (mismas tarjetas, con "Apúntate" e inscripción) y debajo
 * las que añadan editores/admins desde la app.
 */
export default function FormacionesWeb() {
  const [verRealizadas, setVerRealizadas] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {PROXIMAS.map((f) => (
        <FormacionCard key={f.id} formacion={f} />
      ))}

      {/* Formaciones extra creadas desde la app */}
      <VistaSeccion slug="formaciones" compacto ocultarVacio />

      {REALIZADAS.length > 0 && (
        <section className="mt-2">
          <button
            type="button"
            onClick={() => setVerRealizadas((v) => !v)}
            className="text-sm font-semibold text-white/60 hover:text-kanot-pink"
          >
            {verRealizadas ? "Ocultar" : "Ver"} formaciones ya realizadas ({REALIZADAS.length})
          </button>
          {verRealizadas && (
            <div className="mt-3 flex flex-col gap-4 opacity-80">
              {REALIZADAS.map((f) => (
                <FormacionCard key={f.id} formacion={f} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
