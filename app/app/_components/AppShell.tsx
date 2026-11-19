"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { supabaseConfigurado } from "@/app/lib/supabase/client";
import { AuthProvider, useAuth } from "./AuthProvider";
import Acceso from "./Acceso";
import IslaNav from "./IslaNav";
import Avatar from "./Avatar";
import { AvisoElegirGrupo } from "./ElegirGrupo";
import { Boton } from "./ui";

export default function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/app" }).catch(() => {});
    }
  }, []);

  if (!supabaseConfigurado) return <SinConfigurar />;

  return (
    <AuthProvider>
      <Puerta>{children}</Puerta>
    </AuthProvider>
  );
}

function Puerta({ children }: { children: ReactNode }) {
  const { cargando, session, perfil, salir, recargarPerfil } = useAuth();
  const pathname = usePathname();

  // La página de restablecer contraseña gestiona su propia sesión.
  if (pathname.startsWith("/app/restablecer")) return <>{children}</>;
  if (cargando) return <PantallaCarga />;
  if (!session) return <Acceso />;

  if (!perfil || perfil.role === "pendiente") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
        <Image src="/imagenes/logo/bykanot-icon.png" alt="ByKanot" width={72} height={72} />
        <div>
          <h1 className="text-xl font-bold">¡Hola{perfil?.nombre ? `, ${perfil.nombre}` : ""}!</h1>
          <p className="mt-2 text-white/70">
            Tu cuenta está pendiente de aprobación. En cuanto el equipo de Kanot la active podrás ver
            todo el contenido.
          </p>
        </div>
        <div className="flex gap-3">
          <Boton variante="secundario" onClick={() => recargarPerfil()}>
            Volver a comprobar
          </Boton>
          <Boton variante="secundario" onClick={salir}>
            Salir
          </Boton>
        </div>
      </div>
    );
  }

  return <Marco>{children}</Marco>;
}

function Marco({ children }: { children: ReactNode }) {
  const { perfil } = useAuth();
  const nombre = perfil?.nombre?.split(" ")[0];
  const enInicio = usePathname() === "/app";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 print:hidden border-b border-white/10 bg-kanot-navy/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
        <BarraVerComo />
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          {!enInicio && (
            <Link
              href="/app"
              className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2 pr-3 text-sm font-semibold transition hover:border-kanot-pink hover:text-kanot-pink"
            >
              <ChevronLeft size={18} /> Inicio
            </Link>
          )}
          <Link href="/app" className="flex min-w-0 items-center gap-2">
            <Image src="/imagenes/logo/bykanot-icon.png" alt="" width={30} height={30} className="shrink-0" />
            <span className="font-bold tracking-wide">ByKanot</span>
            {nombre && <span className="truncate font-medium text-kanot-pink">{nombre}</span>}
          </Link>
          <Link href="/app/perfil" aria-label="Mi perfil" className="ml-auto shrink-0">
            <Avatar perfil={perfil} tamano={32} />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 print:max-w-none print:p-0">
        <AvisoElegirGrupo />
        {children}
      </main>

      <IslaNav />
    </div>
  );
}

function SinConfigurar() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-bold">Falta conectar Supabase</h1>
      <p className="text-white/70">
        Crea un archivo <code className="text-kanot-pink">.env.local</code> en la raíz del proyecto con:
      </p>
      <pre className="overflow-x-auto rounded-xl bg-black/40 p-4 text-xs">
        {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`}
      </pre>
      <p className="text-sm text-white/50">Y reinicia el servidor (o añádelas en Vercel → Settings → Environment Variables).</p>
    </div>
  );
}

const NOMBRE_VISTA = { admin: "Admin", editor: "Editor", miembro: "Miembro de Kanot", usuario: "Usuario" } as const;

/** Aviso fijo cuando el superadmin está viendo la app como otro rol. */
function BarraVerComo() {
  const { verComo, setVerComo } = useAuth();
  if (!verComo) return null;
  return (
    <div className="flex items-center justify-center gap-3 bg-kanot-pink px-4 py-1.5 text-sm font-semibold text-kanot-navy-deep">
      <span>
        Viendo como <b>{NOMBRE_VISTA[verComo]}</b>
      </span>
      <button
        type="button"
        onClick={() => setVerComo(null)}
        className="rounded-full bg-kanot-navy-deep px-3 py-1 text-xs font-bold text-white"
      >
        Volver
      </button>
    </div>
  );
}

/** Pantalla de carga al abrir la app: el escudo de Kanot con un latido suave. */
function PantallaCarga() {
  return (
    <div
      role="status"
      aria-label="Cargando ByKanot"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-kanot-navy"
    >
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-[2rem] bg-kanot-pink/25 [animation-duration:1.8s]" />
        <Image
          src="/app-icons/icon-192.png"
          alt=""
          width={112}
          height={112}
          priority
          className="relative h-28 w-28 rounded-[2rem] shadow-2xl shadow-black/50"
        />
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-xl font-black tracking-wide">ByKanot</span>
        <span className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-1/3 animate-[carga_1.1s_ease-in-out_infinite] rounded-full bg-kanot-pink" />
        </span>
      </div>
    </div>
  );
}
