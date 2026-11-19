"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import { whatsappUrl } from "@/app/data/merch";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";

/** "Escribir a Kanot": abre WhatsApp con el nombre de la persona (y de su bailarín) ya escrito. */
export default function EscribirKanot({ compacto = false }: { compacto?: boolean }) {
  const { perfil } = useAuth();
  const [bailarines, setBailarines] = useState<string[]>([]);

  useEffect(() => {
    if (!perfil) return;
    getSupabase()
      .from("cuenta_bailarines")
      .select("bailarines(nombre)")
      .eq("user_id", perfil.id)
      .then(({ data }) =>
        setBailarines(
          ((data ?? []) as unknown as { bailarines: { nombre: string } | null }[])
            .map((f) => f.bailarines?.nombre)
            .filter((n): n is string => Boolean(n)),
        ),
      );
  }, [perfil]);

  if (!perfil) return null;
  const nombre = perfil.nombre?.trim();
  const suyos = bailarines.filter((b) => b !== nombre);
  const mensaje = [
    `¡Hola Kanot! Soy ${nombre || "yo"}`,
    suyos.length ? `${perfil.tipo === "familia" ? ", familia de" : " ("}${suyos.join(" y ")}${perfil.tipo === "familia" ? "" : ")"}` : "",
    ". Os escribo desde la app: ",
  ].join("");

  return (
    <a
      href={whatsappUrl(mensaje)}
      target="_blank"
      rel="noreferrer"
      className={
        compacto
          ? "flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold transition hover:border-kanot-pink hover:text-kanot-pink"
          : "flex items-center gap-3 rounded-3xl border border-white/10 bg-black/25 p-4 transition hover:border-kanot-pink/50"
      }
    >
      {compacto ? (
        <>
          <WhatsAppIcon className="h-4 w-4" /> Escribir a Kanot
        </>
      ) : (
        <>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25d366]/15 text-[#25d366]">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">¿Alguna duda? Escribe a Kanot</span>
            <span className="block text-xs text-white/55">Se abre WhatsApp con tu nombre ya puesto.</span>
          </span>
        </>
      )}
    </a>
  );
}
