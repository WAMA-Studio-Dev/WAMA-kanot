"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Camera, Home, Music2, Shirt, Tent, UserRound, UsersRound, type LucideIcon } from "lucide-react";
import { SUBSECCIONES_CREW } from "./secciones";
import { useAuth } from "./AuthProvider";

type ItemNav = { href: string; nombre: string; icono: LucideIcon; activo: (p: string) => boolean };

const empieza = (ruta: string) => (p: string) => p.startsWith(ruta);

const INICIO: ItemNav = { href: "/app", nombre: "Inicio", icono: Home, activo: (p) => p === "/app" };
const CREW: ItemNav = {
  href: "/app/kanot-crew",
  nombre: "Kanot Crew",
  icono: UsersRound,
  activo: (p) => p.startsWith("/app/kanot-crew") || SUBSECCIONES_CREW.some((s) => p.startsWith(`/app/${s}`)),
};
const AGENCIA: ItemNav = { href: "/app/agencia", nombre: "Agencia", icono: Briefcase, activo: empieza("/app/agencia") };
const KODIGO: ItemNav = { href: "/app/kodigo-klub", nombre: "Kodigo", icono: Music2, activo: empieza("/app/kodigo-klub") };
const KAMP: ItemNav = { href: "/app/kanot-kamp", nombre: "Kamp", icono: Tent, activo: empieza("/app/kanot-kamp") };
const MERCH: ItemNav = { href: "/app/merch", nombre: "Merch", icono: Shirt, activo: empieza("/app/merch") };
const FOTOS: ItemNav = { href: "/app/fotografia", nombre: "Fotografía", icono: Camera, activo: empieza("/app/fotografia") };
const PERFIL: ItemNav = {
  href: "/app/perfil",
  nombre: "Perfil",
  icono: UserRound,
  activo: (p) => p.startsWith("/app/perfil") || p.startsWith("/app/usuarios") || p.startsWith("/app/archivos") || p.startsWith("/app/estadisticas"),
};

/** Isla flotante de navegación en la parte inferior. El resto de apartados está en Inicio. */
export default function IslaNav() {
  const pathname = usePathname();
  const { esCrew, esEditor } = useAuth();
  // Admins y editores: Inicio · Kanot Crew · Agencia · Perfil
  // Miembros: Inicio · Kanot Crew · Kamp · Merch · Perfil
  // Usuarios: Inicio · Kodigo · Kamp · Fotografía · Perfil
  const items = esEditor
    ? [INICIO, CREW, AGENCIA, PERFIL]
    : esCrew
      ? [INICIO, CREW, KAMP, MERCH, PERFIL]
      : [INICIO, KODIGO, KAMP, FOTOS, PERFIL];

  return (
    <nav
      aria-label="Navegación principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 print:hidden flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="pointer-events-auto flex gap-1 rounded-full border border-white/15 bg-kanot-navy-deep/85 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        {items.map((item) => {
          const activo = item.activo(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={activo ? "page" : undefined}
                className={`flex w-[4.1rem] flex-col sm:w-24 items-center gap-1 rounded-full py-2 text-[11px] font-medium leading-none transition-colors ${
                  activo ? "bg-kanot-pink text-kanot-navy-deep" : "text-white/65 hover:text-white"
                }`}
              >
                <item.icono size={21} strokeWidth={activo ? 2.4 : 2} />
                {item.nombre}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
