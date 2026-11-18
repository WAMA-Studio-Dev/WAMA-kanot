"use client";

import { Camera } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import { whatsappUrl } from "@/app/data/merch";
import { teamMembers } from "@/app/data/team";
import FormContacto from "../_components/FormContacto";
import Portfolio from "../_components/Portfolio";

const DIEGO = teamMembers.find((m) => m.name === "Diego")!;
const USUARIO_IG = DIEGO.instagram.replace(/\/$/, "").split("/").pop()!;
const MENSAJE_WHATSAPP = "¡Hola! Me interesa una sesión de fotos con ByKanot.";

export default function PaginaFotografia() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
          <Camera size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Fotografía</h1>
          <p className="text-sm text-white/55">Sesiones de fotos con Diego</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-white/80">
        ¿Quieres fotos para tus redes, tu book de bailarín, un evento o una competición? Escríbele a Diego y
        organizáis la sesión.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={whatsappUrl(MENSAJE_WHATSAPP)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-kanot-pink px-5 py-3 text-sm font-bold text-kanot-navy-deep transition hover:bg-white"
        >
          <WhatsAppIcon className="h-4 w-4" /> Escribir por WhatsApp
        </a>
        <a
          href={`https://ig.me/m/${USUARIO_IG}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
        >
          <InstagramIcon className="h-4 w-4" /> Escribir a @{USUARIO_IG}
        </a>
      </div>

      <Portfolio />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">O déjale un mensaje</h2>
        <FormContacto
          tipo="Fotografía (para Diego)"
          textoBoton="Enviar a Diego"
          placeholder="¿Qué tipo de sesión te interesa? Fecha aproximada, lugar, para quién es…"
        />
      </section>
    </div>
  );
}
