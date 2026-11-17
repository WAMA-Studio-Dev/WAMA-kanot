"use client";

import Image from "next/image";
import { Suspense } from "react";
import { ExternalLink, Info, Ticket } from "lucide-react";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import {
  KODIGO_KLUB_DESCRIPCION,
  KODIGO_KLUB_ENTRADAS_HREF,
  KODIGO_KLUB_INSTAGRAM_HREF,
} from "@/app/data/kodigoKlub";
import VistaSeccion from "../_components/VistaSeccion";
import Pestanas, { usePestanaActiva } from "../_components/Pestanas";
import { Cargando } from "../_components/ui";

const PESTANAS = [
  { id: "que-es", nombre: "Qué es", icono: Info },
  { id: "entradas", nombre: "Entradas", icono: Ticket },
] as const;

export default function PaginaKodigoKlub() {
  return (
    <Suspense fallback={<Cargando />}>
      <KodigoKlub />
    </Suspense>
  );
}

function KodigoKlub() {
  const activa = usePestanaActiva(PESTANAS);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center rounded-3xl bg-[#9c1e53] px-6 py-5">
        <Image
          src="/imagenes/kodigoklub/lettering-blanco.png"
          alt="Kodigo Klub"
          width={685}
          height={234}
          className="h-auto w-48"
          priority
        />
      </div>

      <Pestanas pestanas={PESTANAS} activa={activa} />

      {activa === "que-es" && <QueEs />}
      {activa === "entradas" && (
        <div className="flex flex-col gap-5">
          <BotonEntradas />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Próximos eventos</h2>
          <VistaSeccion slug="kodigo-klub" compacto />
        </div>
      )}
    </div>
  );
}

function QueEs() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-base leading-relaxed text-white/85">{KODIGO_KLUB_DESCRIPCION}</p>

      <div className="overflow-hidden rounded-3xl border border-white/10">
        <Image
          src="/imagenes/kodigoklub/QUE ES.jpeg"
          alt="¿Qué es Kodigo Klub?"
          width={1080}
          height={1350}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 640px"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <BotonEntradas />
        <a
          href={KODIGO_KLUB_INSTAGRAM_HREF}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 font-semibold transition hover:bg-white/10"
        >
          <InstagramIcon className="h-5 w-5" /> @kodigoklub
        </a>
      </div>
    </div>
  );
}

function BotonEntradas() {
  return (
    <a
      href={KODIGO_KLUB_ENTRADAS_HREF}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl bg-[#d6127e] px-5 py-4 font-bold text-white shadow-lg shadow-[#d6127e]/30 transition hover:bg-[#9c1e53]"
    >
      <Ticket size={20} /> Comprar entradas <ExternalLink size={16} className="opacity-70" />
    </a>
  );
}
