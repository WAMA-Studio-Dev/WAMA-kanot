"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import { teamMembers } from "@/app/data/team";
import FormContacto from "../_components/FormContacto";

const DIEGO = teamMembers.find((m) => m.name === "Diego")!;
const USUARIO_IG = DIEGO.instagram.replace(/\/$/, "").split("/").pop()!;

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

      {/* Ficha de Diego */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
        <div className="relative aspect-[4/3] w-full">
          <Image src={DIEGO.photo} alt={DIEGO.name} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" priority />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 pt-16">
            <p className="text-2xl font-black">{DIEGO.name}</p>
            <p className="text-sm text-white/75">{DIEGO.role}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-5">
          <p className="text-sm leading-relaxed text-white/80">
            ¿Quieres fotos para tus redes, tu book de bailarín, un evento o una competición? Escríbele a Diego y
            organizáis la sesión.
          </p>
          <a
            href={`https://ig.me/m/${USUARIO_IG}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-kanot-pink px-5 py-3 text-sm font-bold text-kanot-navy-deep transition hover:bg-white"
          >
            <InstagramIcon className="h-4 w-4" /> Escribir a @{USUARIO_IG}
          </a>
        </div>
      </div>

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
