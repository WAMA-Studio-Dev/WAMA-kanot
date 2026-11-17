"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/app/lib/supabase/client";
import type { Perfil } from "./secciones";

type AuthState = {
  cargando: boolean;
  session: Session | null;
  perfil: Perfil | null;
  esEditor: boolean;
  esAdmin: boolean;
  recargarPerfil: () => Promise<void>;
  salir: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

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

  const valor: AuthState = {
    cargando,
    session,
    perfil,
    esEditor: perfil?.role === "editor" || perfil?.role === "admin",
    esAdmin: perfil?.role === "admin",
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
