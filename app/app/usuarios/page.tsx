"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "../_components/AuthProvider";
import { GRUPOS, type Perfil, type Rol } from "../_components/secciones";
import { Aviso, Cargando, Select } from "../_components/ui";
import Avatar from "../_components/Avatar";

const ROLES: { valor: Rol; nombre: string; ayuda: string }[] = [
  { valor: "pendiente", nombre: "Pendiente", ayuda: "Sin acceso todavía" },
  { valor: "usuario", nombre: "Usuario", ayuda: "Ve la app, sin Kanot Crew" },
  { valor: "miembro", nombre: "Miembro de Kanot", ayuda: "Además entra en Kanot Crew (horarios, competición, autorizaciones)" },
  { valor: "editor", nombre: "Editor", ayuda: "Puede hacer de todo menos gestionar roles" },
  { valor: "admin", nombre: "Admin", ayuda: "Todo + aprueba usuarios y cambia roles (menos a otros admins)" },
];

export default function GestionUsuarios() {
  const { esAdmin, esSuper, perfil: yo, recargarPerfil } = useAuth();
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
    if (role === "admin" && !confirm(`¿Hacer admin a ${p.nombre ?? p.email}? Después solo el superadmin podrá cambiarle el rol.`))
      return;
    const { error } = await getSupabase().from("profiles").update({ role }).eq("id", p.id);
    if (error) return setError(traducir(error.message));
    if (esYo) recargarPerfil();
    else cargar();
  }

  async function cambiarGrupo(p: Perfil, grupo: string) {
    const { error } = await getSupabase().from("profiles").update({ grupo: grupo || null }).eq("id", p.id);
    if (error) return setError(/grupo/i.test(error.message) ? "Falta activar los grupos (SQL 009)." : traducir(error.message));
    if (p.id === yo?.id) recargarPerfil();
    cargar();
  }

  const lista = perfiles ?? [];
  const deRol = (rol: Rol) => lista.filter((p) => p.role === rol);
  const miembros = deRol("miembro");
  const props = { onCambiar: cambiarRol, onGrupo: cambiarGrupo, esSuper };

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

      <Bloque titulo="Pendientes de aprobar" n={deRol("pendiente").length} destacado>
        <ListaPerfiles perfiles={deRol("pendiente")} {...props} />
      </Bloque>

      <Bloque titulo="Usuarios" n={deRol("usuario").length}>
        <ListaPerfiles perfiles={deRol("usuario")} {...props} />
      </Bloque>

      <Bloque titulo="Miembros de Kanot" n={miembros.length}>
        <div className="flex flex-col gap-4">
          {[...GRUPOS_CREW.map((g) => g.nombre), "Sin grupo"].map((grupo) => {
            const delGrupo = miembros.filter((p) => (p.grupo ?? "Sin grupo") === grupo);
            if (!delGrupo.length) return null;
            const color = GRUPOS_CREW.find((g) => g.nombre === grupo)?.color;
            return (
              <div key={grupo}>
                <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-bold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color ?? "rgba(255,255,255,0.3)" }} />
                  {grupo}
                  <span className="font-medium text-white/40">· {delGrupo.length}</span>
                </h3>
                <ListaPerfiles perfiles={delGrupo} {...props} />
              </div>
            );
          })}
        </div>
      </Bloque>

      <Bloque titulo="Editores" n={deRol("editor").length}>
        <ListaPerfiles perfiles={deRol("editor")} {...props} />
      </Bloque>

      <Bloque titulo="Admins" n={deRol("admin").length}>
        {/* El superadmin, el primero */}
        <ListaPerfiles
          perfiles={[...deRol("admin")].sort((x, y) => Number(!!y.super_admin) - Number(!!x.super_admin))}
          {...props}
        />
      </Bloque>

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

function traducir(msg: string) {
  if (/otro admin/i.test(msg)) return "No puedes cambiar el rol de otro admin. Solo el superadmin puede hacerlo.";
  if (/superadmin/i.test(msg)) return "El rol del superadmin no se puede cambiar desde la app.";
  return msg;
}

const GRUPOS_CREW = GRUPOS.filter((g) => g.nombre !== "Todos juntos");

/** Sección de la lista (no se muestra si está vacía). */
function Bloque({
  titulo,
  n,
  destacado,
  children,
}: {
  titulo: string;
  n: number;
  destacado?: boolean;
  children: React.ReactNode;
}) {
  if (!n) return null;
  return (
    <section>
      <h2
        className={`mb-3 text-sm font-semibold uppercase tracking-widest ${destacado ? "text-kanot-pink" : "text-white/60"}`}
      >
        {titulo} ({n})
      </h2>
      {children}
    </section>
  );
}

function ListaPerfiles({
  perfiles,
  onCambiar,
  onGrupo,
  esSuper,
}: {
  perfiles: Perfil[];
  onCambiar: (p: Perfil, r: Rol) => void;
  onGrupo: (p: Perfil, grupo: string) => void;
  esSuper: boolean;
}) {
  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
      {perfiles.map((p) => (
        <li key={p.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar perfil={p} tamano={40} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate font-medium">
                {p.nombre || "Sin nombre"}
                {p.super_admin && (
                  <span className="rounded-full bg-kanot-pink px-2 py-0.5 text-[10px] font-bold uppercase text-kanot-navy-deep">
                    Superadmin
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-white/50">{p.email}</p>
            </div>
          </div>
          {p.role === "miembro" && (
            <Select
              value={p.grupo ?? ""}
              onChange={(e) => onGrupo(p, e.target.value)}
              className="py-2 text-sm sm:w-36"
              aria-label={`Grupo de ${p.nombre ?? p.email}`}
            >
              <option value="">Sin grupo</option>
              {GRUPOS_CREW.map((g) => (
                <option key={g.nombre} value={g.nombre}>
                  {g.nombre}
                </option>
              ))}
            </Select>
          )}
          <Select
            value={p.role}
            onChange={(e) => onCambiar(p, e.target.value as Rol)}
            // Un admin no puede tocar a otro admin; el superadmin no se toca desde la app.
            disabled={p.super_admin || (p.role === "admin" && !esSuper)}
            title={p.super_admin ? "Superadmin" : p.role === "admin" && !esSuper ? "Solo el superadmin puede cambiar a un admin" : undefined}
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
