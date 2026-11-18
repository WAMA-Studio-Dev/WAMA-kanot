"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "../_components/AuthProvider";
import type { Perfil, Rol } from "../_components/secciones";
import { Aviso, Cargando, Select } from "../_components/ui";
import Avatar from "../_components/Avatar";

const ROLES: { valor: Rol; nombre: string; ayuda: string }[] = [
  { valor: "pendiente", nombre: "Pendiente", ayuda: "Sin acceso todavía" },
  { valor: "usuario", nombre: "Usuario", ayuda: "Ve la app, sin Kanot Crew" },
  { valor: "miembro", nombre: "Miembro de Kanot", ayuda: "Además entra en Kanot Crew (horarios, competición, autorizaciones)" },
  { valor: "editor", nombre: "Editor", ayuda: "Edita contenido y gestiona archivos" },
  { valor: "admin", nombre: "Admin", ayuda: "Todo lo anterior + aprueba usuarios" },
];

export default function GestionUsuarios() {
  const { esAdmin, perfil: yo, recargarPerfil } = useAuth();
  const [perfiles, setPerfiles] = useState<Perfil[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setPerfiles(data as Perfil[]);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos
    if (esAdmin) cargar();
  }, [cargar, esAdmin]);

  if (!esAdmin) return <Aviso>Esta sección es solo para administradores.</Aviso>;

  async function cambiarRol(p: Perfil, role: Rol) {
    const esYo = p.id === yo?.id;
    if (esYo && role !== "admin" && !confirm("Vas a quitarte el rol de admin. ¿Seguro?")) return;
    const { error } = await getSupabase().from("profiles").update({ role }).eq("id", p.id);
    if (error) return setError(error.message);
    if (esYo) recargarPerfil();
    else cargar();
  }

  const pendientes = perfiles?.filter((p) => p.role === "pendiente") ?? [];
  const resto = perfiles?.filter((p) => p.role !== "pendiente") ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
          <Users size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Usuarios</h1>
          <p className="text-sm text-white/55">Aprueba cuentas y asigna roles</p>
        </div>
      </div>

      {error && <Aviso>{error}</Aviso>}
      {!perfiles && !error && <Cargando />}

      {pendientes.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-kanot-pink">
            Pendientes de aprobar ({pendientes.length})
          </h2>
          <ListaPerfiles perfiles={pendientes} onCambiar={cambiarRol} />
        </section>
      )}

      {resto.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">
            Con acceso ({resto.length})
          </h2>
          <ListaPerfiles perfiles={resto} onCambiar={cambiarRol} />
        </section>
      )}

      <div className="rounded-2xl bg-white/5 p-4 text-xs leading-relaxed text-white/55">
        {ROLES.map((r) => (
          <p key={r.valor}>
            <b className="text-white/80">{r.nombre}:</b> {r.ayuda}
          </p>
        ))}
      </div>
    </div>
  );
}

function ListaPerfiles({ perfiles, onCambiar }: { perfiles: Perfil[]; onCambiar: (p: Perfil, r: Rol) => void }) {
  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
      {perfiles.map((p) => (
        <li key={p.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar perfil={p} tamano={40} />
            <div className="min-w-0">
              <p className="truncate font-medium">{p.nombre || "Sin nombre"}</p>
              <p className="truncate text-xs text-white/50">{p.email}</p>
            </div>
          </div>
          <Select
            value={p.role}
            onChange={(e) => onCambiar(p, e.target.value as Rol)}
            className="py-2 text-sm sm:w-44"
            aria-label={`Rol de ${p.nombre ?? p.email}`}
          >
            {ROLES.map((r) => (
              <option key={r.valor} value={r.valor}>
                {r.nombre}
              </option>
            ))}
          </Select>
        </li>
      ))}
    </ul>
  );
}
