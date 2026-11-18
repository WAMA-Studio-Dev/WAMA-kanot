"use client";

import { Suspense } from "react";
import { CalendarClock, ExternalLink, FolderOpen, GraduationCap, Lock, Trophy, UsersRound } from "lucide-react";
import { useAuth } from "../_components/AuthProvider";
import VistaSeccion from "../_components/VistaSeccion";
import GestorArchivos from "../_components/GestorArchivos";
import FormacionesWeb from "../_components/FormacionesWeb";
import GaleriaCrew from "../_components/GaleriaCrew";
import { KANOT_DRIVE_URL } from "../_components/secciones";
import { Cargando } from "../_components/ui";
import Pestanas, { usePestanaActiva } from "../_components/Pestanas";

const PESTANAS = [
  { id: "horarios", nombre: "Horarios", icono: CalendarClock, soloEquipo: false },
  { id: "competicion", nombre: "Competición", icono: Trophy, soloEquipo: false },
  { id: "formaciones", nombre: "Formaciones", icono: GraduationCap, soloEquipo: false },
  { id: "archivos", nombre: "Archivos", icono: FolderOpen, soloEquipo: false },
] as const;

export default function PaginaKanotCrew() {
  return (
    <Suspense fallback={<Cargando />}>
      <KanotCrew />
    </Suspense>
  );
}

function KanotCrew() {
  const { esEditor, esCrew } = useAuth();
  const visibles = PESTANAS.filter((p) => !p.soloEquipo || esEditor);
  const activa = usePestanaActiva(visibles);

  if (!esCrew) return <SoloMiembros />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
          <UsersRound size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Kanot Crew</h1>
          <p className="text-sm text-white/55">Horarios, competición y formaciones</p>
        </div>
      </div>

      <Pestanas pestanas={visibles} activa={activa} />

      {activa === "horarios" && <VistaSeccion key="horarios" slug="horarios" compacto />}
      {activa === "competicion" && <VistaSeccion key="competicion" slug="competicion" compacto />}
      {activa === "formaciones" && <FormacionesWeb />}
      {activa === "archivos" && (
        <div className="flex flex-col gap-8">
          {/* Para todos los miembros */}
          <GaleriaCrew />

          {/* Solo editores y admins: Drive y gestor de documentos */}
          {esEditor && (
            <section className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <div>
                <h2 className="text-xl font-black">Documentos del equipo</h2>
                <p className="text-xs text-white/55">Solo lo ven editores y admins. Sube aquí lo que quieras: Excels, PDFs…</p>
              </div>
          {KANOT_DRIVE_URL ? (
            <a
              href={KANOT_DRIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-3xl border border-kanot-electric/30 bg-kanot-electric/10 p-4 transition hover:bg-kanot-electric/15"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white">
                <GoogleDriveLogo />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">Drive de Kanot</span>
                <span className="block text-xs text-white/55">Abre la carpeta compartida de Google Drive</span>
              </span>
              <ExternalLink size={18} className="text-white/40" />
            </a>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/15 p-4 text-sm text-white/55">
              Aquí irá el botón al Drive de Kanot en cuanto se configure el enlace.
            </p>
          )}
          <GestorArchivos raiz="Kanot Crew" />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function GoogleDriveLogo() {
  return (
    <svg viewBox="0 0 87.3 78" width="24" height="22" aria-hidden>
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A9.06 9.06 0 0 0 0 53h27.5z" fill="#00ac47" />
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335" />
      <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="M73.4 26.5 60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

/** Pantalla para quien no es miembro de Kanot Crew. */
function SoloMiembros() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-kanot-pink">
        <Lock size={28} />
      </span>
      <h1 className="text-2xl font-black">Solo para Kanot Crew</h1>
      <p className="max-w-xs text-sm text-white/65">
        Los horarios, la competición y las autorizaciones son solo para los miembros del grupo. Si formas parte de
        Kanot Crew, pide al equipo que active tu cuenta como miembro.
      </p>
    </div>
  );
}
