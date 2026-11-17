"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { supabaseConfigurado } from "@/app/lib/supabase/client";
import { AuthProvider, useAuth } from "./AuthProvider";
import Acceso from "./Acceso";
import IslaNav from "./IslaNav";
import { Boton, Cargando } from "./ui";

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
  if (cargando) return <Cargando />;
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
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-kanot-navy/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link href="/app" className="flex items-center gap-2">
            <Image src="/imagenes/logo/bykanot-icon.png" alt="" width={30} height={30} />
            <span className="font-bold tracking-wide">Kanot</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6">
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
