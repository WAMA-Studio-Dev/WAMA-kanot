"use client";

import { Suspense } from "react";
import { GraduationCap, Info, PenLine, Tent } from "lucide-react";
import VistaSeccion from "../_components/VistaSeccion";
import Pestanas, { usePestanaActiva } from "../_components/Pestanas";
import { Cargando } from "../_components/ui";

const PESTANAS = [
  { id: "que-es", nombre: "Qué es", icono: Info },
  { id: "profesores", nombre: "Profesores", icono: GraduationCap },
  { id: "inscribete", nombre: "Inscríbete", icono: PenLine },
] as const;

export default function PaginaKanotKamp() {
  return (
    <Suspense fallback={<Cargando />}>
      <KanotKamp />
    </Suspense>
  );
}

function KanotKamp() {
  const activa = usePestanaActiva(PESTANAS);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kanot-electric/20 text-kanot-electric">
          <Tent size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Kanot Kamp</h1>
          <p className="text-sm text-white/55">Campus, convivencias e intensivos</p>
        </div>
      </div>

      <Pestanas pestanas={PESTANAS} activa={activa} />

      {activa === "que-es" && <VistaSeccion key="info" slug="kanot-kamp-info" compacto />}
      {activa === "profesores" && <VistaSeccion key="profes" slug="kanot-kamp-profes" compacto />}
      {activa === "inscribete" && <VistaSeccion key="inscribete" slug="kanot-kamp" compacto />}
    </div>
  );
}
