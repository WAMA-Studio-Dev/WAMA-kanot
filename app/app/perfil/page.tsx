"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ChevronRight, FolderOpen, KeyRound, LogOut, Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "../_components/AuthProvider";
import InstalarApp from "../_components/InstalarApp";
import { Aviso, Boton, Etiqueta, Input, Modal } from "../_components/ui";

const NOMBRE_ROL = { pendiente: "Pendiente", usuario: "Usuario", editor: "Editor", admin: "Admin" } as const;

export default function PaginaPerfil() {
  const { perfil, esEditor, esAdmin, salir } = useAuth();
  const [cambiarClave, setCambiarClave] = useState(false);
  if (!perfil) return null;

  const enlaces = [
    { href: "/app/archivos", nombre: "Gestor de archivos", ayuda: "Todos los archivos del equipo", icono: FolderOpen, ver: esEditor },
    { href: "/app/usuarios", nombre: "Usuarios", ayuda: "Aprobar cuentas y asignar roles", icono: Users, ver: esAdmin },
  ].filter((e) => e.ver);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-kanot-pink text-3xl font-bold text-kanot-navy-deep">
          {(perfil.nombre ?? perfil.email ?? "?").charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-xl font-bold">{perfil.nombre || "Sin nombre"}</h1>
          <p className="text-sm text-white/55">{perfil.email}</p>
          <span className="mt-2 inline-block rounded-full bg-kanot-pink/15 px-3 py-1 text-xs font-semibold text-kanot-pink">
            {NOMBRE_ROL[perfil.role]}
          </span>
        </div>
      </div>

      <InstalarApp />

      {enlaces.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">Equipo</h2>
          <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5">
                  <e.icono size={20} className="text-kanot-pink" />
                  <span className="flex-1">
                    <span className="block font-medium">{e.nombre}</span>
                    <span className="block text-xs text-white/50">{e.ayuda}</span>
                  </span>
                  <ChevronRight size={18} className="text-white/30" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">Cuenta</h2>
        <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
          <li>
            <button
              type="button"
              onClick={() => setCambiarClave(true)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5"
            >
              <KeyRound size={20} className="text-kanot-pink" />
              <span className="flex-1 font-medium">Cambiar contraseña</span>
              <ChevronRight size={18} className="text-white/30" />
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={salir}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-red-200 hover:bg-white/5"
            >
              <LogOut size={20} />
              <span className="flex-1 font-medium">Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </section>

      {cambiarClave && <CambiarClave onCerrar={() => setCambiarClave(false)} />}
    </div>
  );
}

function CambiarClave({ onCerrar }: { onCerrar: () => void }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await getSupabase().auth.updateUser({ password: clave });
    setEnviando(false);
    if (error) setError(error.message);
    else setOk(true);
  }

  return (
    <Modal titulo="Cambiar contraseña" onCerrar={onCerrar}>
      {ok ? (
        <div className="flex flex-col gap-4">
          <Aviso tipo="ok">Contraseña cambiada.</Aviso>
          <Boton onClick={onCerrar}>Cerrar</Boton>
        </div>
      ) : (
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <Etiqueta texto="Contraseña nueva">
            <Input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              minLength={6}
              required
              autoFocus
              autoComplete="new-password"
            />
          </Etiqueta>
          {error && <Aviso>{error}</Aviso>}
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Guardando…" : "Guardar"}
          </Boton>
        </form>
      )}
    </Modal>
  );
}
