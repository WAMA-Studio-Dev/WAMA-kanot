"use client";

import { Camera, ChevronDown, PartyPopper, Smartphone, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import { whatsappUrl } from "@/app/data/merch";
import { teamMembers } from "@/app/data/team";
import FormContacto from "../_components/FormContacto";
import Portfolio from "../_components/Portfolio";

const DIEGO = teamMembers.find((m) => m.name === "Diego")!;
const USUARIO_IG = DIEGO.instagram.replace(/\/$/, "").split("/").pop()!;

const SESIONES: { nombre: string; ayuda: string; icono: LucideIcon }[] = [
  { nombre: "Book de bailarín", ayuda: "Retratos y poses de baile", icono: Sparkles },
  { nombre: "Fotos para redes", ayuda: "Contenido para tu Instagram", icono: Smartphone },
  { nombre: "Eventos", ayuda: "Fiestas, quedadas, Kodigo…", icono: PartyPopper },
  { nombre: "Competiciones", ayuda: "Tu actuación en el campeonato", icono: Trophy },
];

const PASOS = [
  { titulo: "Escríbele", texto: "Elige el tipo de sesión y mándale un mensaje." },
  { titulo: "Organizáis", texto: "Fecha, lugar y estilo de las fotos." },
  { titulo: "Tus fotos", texto: "Te las pasa editadas y listas para usar." },
];

const mensaje = (sesion?: string) =>
  sesion ? `¡Hola Diego! Me interesa una sesión de fotos: ${sesion}.` : "¡Hola Diego! Me interesa una sesión de fotos con ByKanot.";

export default function PaginaFotografia() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kanot-pink/15 text-kanot-pink">
          <Camera size={24} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight">Fotografía</h1>
          <a href={DIEGO.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-white/55 hover:text-kanot-pink">
            Sesiones con Diego · <InstagramIcon className="h-3.5 w-3.5" /> @{USUARIO_IG}
          </a>
        </div>
      </div>

      {/* Tipos de sesión: cada una abre WhatsApp con el mensaje listo */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-black">¿Qué sesión quieres?</h2>
          <p className="text-sm text-white/55">Pulsa una y se abre WhatsApp con el mensaje escrito.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SESIONES.map((s) => (
            <a
              key={s.nombre}
              href={whatsappUrl(mensaje(s.nombre))}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-kanot-pink/60 hover:bg-kanot-pink/[0.07]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kanot-pink/15 text-kanot-pink">
                <s.icono size={20} />
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight">{s.nombre}</span>
                <span className="block text-xs text-white/55">{s.ayuda}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <Portfolio />

      {/* Cómo funciona */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-black">Cómo funciona</h2>
        <ol className="grid gap-2 sm:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kanot-pink text-sm font-black text-kanot-navy-deep">
                {i + 1}
              </span>
              <span>
                <span className="block text-sm font-bold">{p.titulo}</span>
                <span className="block text-xs leading-relaxed text-white/60">{p.texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Contacto */}
      <section className="flex flex-col gap-3 rounded-3xl border border-kanot-pink/25 bg-kanot-pink/[0.07] p-5">
        <h2 className="text-lg font-black">¿Hablamos?</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={whatsappUrl(mensaje())}
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
            <InstagramIcon className="h-4 w-4" /> Escribir por Instagram
          </a>
        </div>
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1 py-1 text-xs font-semibold text-white/60 hover:text-white">
            Prefiero dejarle un mensaje <ChevronDown size={14} className="transition group-open:rotate-180" />
          </summary>
          <div className="mt-3">
            <FormContacto
              tipo="Fotografía (para Diego)"
              textoBoton="Enviar a Diego"
              placeholder="¿Qué tipo de sesión te interesa? Fecha aproximada, lugar, para quién es…"
            />
          </div>
        </details>
      </section>
    </div>
  );
}
