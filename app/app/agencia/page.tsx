"use client";

import { Suspense } from "react";
import { Briefcase, Inbox, Info, Mail, UsersRound } from "lucide-react";
import SolicitudesAgencia from "../_components/SolicitudesAgencia";
import FichasAgencia from "../_components/FichasAgencia";
import VistaSeccion from "../_components/VistaSeccion";
import FormContacto from "../_components/FormContacto";
import Pestanas, { usePestanaActiva } from "../_components/Pestanas";
import { Aviso, Cargando } from "../_components/ui";
import { useAuth } from "../_components/AuthProvider";

const PESTANAS = [
  { id: "que-es", nombre: "Qué es", icono: Info },
  { id: "bailarines", nombre: "Bailarines", icono: UsersRound },
  { id: "solicitudes", nombre: "Solicitudes", icono: Inbox },
  { id: "contacto", nombre: "Contacto", icono: Mail },
] as const;

export default function PaginaAgencia() {
  return (
    <Suspense fallback={<Cargando />}>
      <Agencia />
    </Suspense>
  );
}

function Agencia() {
  const activa = usePestanaActiva(PESTANAS);
  const { esEditor } = useAuth();
  if (!esEditor) return <Aviso>Esta sección es solo para editores y administradores.</Aviso>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
          <Briefcase size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Agencia</h1>
          <p className="text-sm text-white/55">Representación de bailarines</p>
        </div>
      </div>

      <Pestanas pestanas={PESTANAS} activa={activa} />

      {activa === "que-es" && <VistaSeccion key="agencia" slug="agencia" compacto />}
      {activa === "bailarines" && <FichasAgencia />}
      {activa === "solicitudes" && <SolicitudesAgencia />}
      {activa === "contacto" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/70">
            ¿Buscas bailarines para un videoclip, evento, campaña o show? ¿O quieres formar parte de la agencia?
            Escríbenos y te respondemos.
          </p>
          <FormContacto
            tipo="Agencia"
            placeholder="Cuéntanos el proyecto: fecha, lugar, perfil de bailarines… o preséntate si quieres unirte."
          />
        </div>
      )}
    </div>
  );
}
