"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CreditCard, Smartphone, Users } from "lucide-react";
import { useAuth } from "./AuthProvider";

const NOMBRE_ROL = { pendiente: "Pendiente", usuario: "Usuario", miembro: "Miembro de Kanot", editor: "Editor", admin: "Admin" } as const;

/** La primera vez que alguien entra con la cuenta ya aprobada: bienvenida y primeros pasos. */
export default function Bienvenida() {
  const { perfil, verComo } = useAuth();
  const [ver, setVer] = useState(false);
  const clave = perfil ? `kanot-bienvenida-${perfil.id}` : null;

  useEffect(() => {
    if (!clave || verComo || perfil?.role === "pendiente") return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- solo una vez por cuenta y móvil
      if (!localStorage.getItem(clave)) setVer(true);
    } catch {
      /* sin almacenamiento: no se enseña */
    }
  }, [clave, verComo, perfil?.role]);

  if (!ver || !perfil) return null;
  const esCrew = ["miembro", "editor", "admin"].includes(perfil.role);

  function cerrar() {
    try {
      if (clave) localStorage.setItem(clave, "1");
    } catch {
      /* nada */
    }
    setVer(false);
  }

  const pasos = [
    { icono: Smartphone, texto: "Instálala en el móvil para abrirla como una app más." },
    { icono: Bell, texto: "Activa las notificaciones para recibir avisos y recordatorios." },
    { icono: CreditCard, texto: "Completa tu perfil y tu carnet de Kanot irá subiendo de nivel." },
    ...(esCrew ? [{ icono: Users, texto: "Elige tu grupo y mira tus horarios en Kanot Crew." }] : []),
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={cerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bienvenida"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-t-[2rem] border border-white/10 bg-kanot-navy-deep pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[2rem]"
      >
        <div className="tema-fijo relative flex flex-col items-center gap-3 bg-gradient-to-br from-kanot-pink/40 via-kanot-navy to-kanot-electric/30 px-6 pb-6 pt-8 text-center">
          <Image src="/app-icons/icon-192.png" alt="" width={64} height={64} className="h-16 w-16 rounded-2xl shadow-xl shadow-black/30" />
          <h2 className="text-2xl font-black leading-tight">
            ¡Bienvenido/a{perfil.nombre ? `, ${perfil.nombre.split(" ")[0]}` : ""}!
          </h2>
          <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold text-kanot-pink">
            {perfil.super_admin ? "Superadmin" : NOMBRE_ROL[perfil.role]}
          </span>
          <p className="text-sm text-white/80">Ya tienes acceso a la app de Kanot. Para empezar:</p>
        </div>
        <ul className="flex flex-col gap-3 px-6 pt-5">
          {pasos.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-kanot-pink/15 text-kanot-pink">
                <p.icono size={16} />
              </span>
              <span className="pt-1.5 text-white/80">{p.texto}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-2 px-6">
          <Link
            href="/app/perfil"
            onClick={cerrar}
            className="flex items-center justify-center rounded-full bg-kanot-pink py-3 text-sm font-bold text-kanot-navy-deep transition hover:bg-white"
          >
            Ir a mi perfil
          </Link>
          <button type="button" onClick={cerrar} className="py-2 text-sm font-semibold text-white/60 hover:text-white">
            Empezar a explorar
          </button>
        </div>
      </div>
    </div>
  );
}
