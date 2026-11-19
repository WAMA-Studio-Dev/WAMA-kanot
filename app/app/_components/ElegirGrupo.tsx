"use client";

import { useState } from "react";
import { UsersRound } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { GRUPOS } from "./secciones";

const GRUPOS_CREW = GRUPOS.filter((g) => g.nombre !== "Todos juntos");

/** Hook compartido: guarda el grupo del propio miembro. */
function useGuardarGrupo() {
  const { perfil, recargarPerfil } = useAuth();
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function elegir(grupo: string) {
    setGuardando(grupo);
    setError(null);
    const { error } = await getSupabase().rpc("actualizar_mi_grupo", { p_grupo: grupo });
    if (error) {
      setError(/actualizar_mi_grupo|schema cache|does not exist/i.test(error.message) ? "Falta activar los grupos (SQL 009)." : error.message);
    } else {
      await recargarPerfil();
    }
    setGuardando(null);
  }
  return { perfil, guardando, error, elegir };
}

function BotonesGrupo({
  actual,
  guardando,
  onElegir,
}: {
  actual: string | null | undefined;
  guardando: string | null;
  onElegir: (g: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {GRUPOS_CREW.map((g) => {
        const activo = actual === g.nombre;
        return (
          <button
            key={g.nombre}
            type="button"
            onClick={() => onElegir(activo ? "" : g.nombre)}
            disabled={guardando !== null}
            aria-pressed={activo}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${
              activo ? "border-white bg-white text-kanot-navy-deep" : "border-white/15 bg-black/25 hover:border-white/40"
            }`}
          >
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: g.color }} />
            {guardando === g.nombre ? "Guardando…" : g.nombre}
          </button>
        );
      })}
    </div>
  );
}

/** Perfil → "Mi grupo" (solo miembros de Kanot Crew). */
export default function ElegirGrupo() {
  const { perfil, guardando, error, elegir } = useGuardarGrupo();
  return (
    <section id="mi-grupo" className="scroll-mt-24">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">
        Mi grupo · puedes cambiarlo cuando quieras
      </h2>
      <BotonesGrupo actual={perfil?.grupo} guardando={guardando} onElegir={elegir} />
      {error ? (
        <p className="mt-2 px-1 text-xs text-red-200">{error}</p>
      ) : (
        <p className="mt-2 px-1 text-[11px] text-white/40">
          {perfil?.grupo ? "Pulsa otra vez para quitarlo." : "Elige tu grupo para que el equipo te tenga localizado."}
        </p>
      )}
    </section>
  );
}

/** Aviso arriba en toda la app cuando un miembro todavía no ha elegido grupo. */
export function AvisoElegirGrupo() {
  const { rol } = useAuth();
  const { perfil, guardando, error, elegir } = useGuardarGrupo();
  if (rol !== "miembro" || perfil?.grupo) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-kanot-pink/40 bg-kanot-pink/10 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kanot-pink text-kanot-navy-deep">
          <UsersRound size={20} />
        </span>
        <div>
          <p className="font-bold">¡Ya eres de Kanot Crew! ¿En qué grupo estás?</p>
          <p className="text-sm text-white/65">Elígelo para que el equipo te tenga localizado.</p>
        </div>
      </div>
      <BotonesGrupo actual={perfil?.grupo} guardando={guardando} onElegir={elegir} />
      {error && <p className="text-xs text-red-200">{error}</p>}
    </div>
  );
}
