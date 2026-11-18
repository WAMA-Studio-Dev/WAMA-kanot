"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/app/lib/supabase/client";
import type { Perfil, Rol } from "./secciones";

const CLAVE_VER_COMO = "kanot-ver-como";
/** Roles que el superadmin puede usar para ver la app como los demás. */
export type RolVista = Exclude<Rol, "pendiente">;

type AuthState = {
  cargando: boolean;
  session: Session | null;
  perfil: Perfil | null;
  esEditor: boolean;
  /** Miembro de Kanot Crew (o editor/admin): puede entrar en Kanot Crew. */
  esCrew: boolean;
  esAdmin: boolean;
  /** Superadmin (real, no cambia con "ver como"). */
  esSuper: boolean;
  /** Rol con el que el superadmin está viendo la app (null = el suyo). */
  verComo: RolVista | null;
  setVerComo: (rol: RolVista | null) => void;
  recargarPerfil: () => Promise<void>;
  salir: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [verComo, setVerComoEstado] = useState<RolVista | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada en este navegador
      setVerComoEstado((localStorage.getItem(CLAVE_VER_COMO) as RolVista | null) || null);
    } catch {}
  }, []);

  function setVerComo(rol: RolVista | null) {
    setVerComoEstado(rol);
    try {
      if (rol) localStorage.setItem(CLAVE_VER_COMO, rol);
      else localStorage.removeItem(CLAVE_VER_COMO);
    } catch {}
  }

  const cargarPerfil = useCallback(async (s: Session | null) => {
    if (!s) {
      setPerfil(null);
      return;
    }
    const { data } = await getSupabase()
      .from("profiles")
      .select("*")
      .eq("id", s.user.id)
      .maybeSingle();
    setPerfil((data as Perfil) ?? null);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    let activo = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!activo) return;
      setSession(data.session);
      await cargarPerfil(data.session);
      if (activo) setCargando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s);
      // Fuera del callback para no bloquear el cliente de auth.
      setTimeout(() => cargarPerfil(s), 0);
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  const esSuper = perfil?.role === "admin" && perfil?.super_admin === true;
  // El superadmin puede "ver como" otro rol: solo cambia lo que muestra la app, no su rol real.
  const vista = esSuper && verComo ? verComo : null;
  const rol = vista ?? perfil?.role;

  const valor: AuthState = {
    cargando,
    session,
    perfil,
    esEditor: rol === "editor" || rol === "admin",
    esCrew: rol === "miembro" || rol === "editor" || rol === "admin",
    esAdmin: rol === "admin",
    esSuper,
    verComo: vista,
    setVerComo,
    recargarPerfil: () => cargarPerfil(session),
    salir: async () => {
      await getSupabase().auth.signOut();
    },
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
