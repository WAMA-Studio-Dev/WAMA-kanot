"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import GaleriaLightbox from "@/app/components/temporadas/GaleriaLightbox";

type Marco = "polaroid" | "magenta" | "plano" | "cinta";

type Pieza = {
  /** Posición y ancho en % del ancho del lienzo; `y` en las mismas unidades. */
  x: number;
  y: number;
  w: number;
  rot: number;
  marco: Marco;
};

type Foto = { src: string; vertical: boolean };

const MARCOS: Marco[] = ["polaroid", "magenta", "plano", "cinta", "plano", "magenta", "polaroid", "plano"];

// Escritorio: composición a mano para 17 fotos (H = horizontal, V = vertical).
// Lienzo de 100 de ancho × 128 de alto, en "unidades de ancho".
const LIENZO_ALTO = 128;
const PIEZAS_ESCRITORIO: Omit<Pieza, "marco">[] = [
  { x: 2, y: 4, w: 34, rot: -4 }, // H
  { x: 33, y: 0, w: 20, rot: 3 }, // V
  { x: 51, y: 7, w: 30, rot: -2 }, // H
  { x: 80, y: 2, w: 18, rot: 5 }, // V
  { x: 7, y: 26, w: 21, rot: 2 }, // V
  { x: 26, y: 31, w: 32, rot: -3 }, // H
  { x: 56, y: 27, w: 28, rot: 4 }, // H
  { x: 79, y: 30, w: 19, rot: -4 }, // V
  { x: 0, y: 58, w: 30, rot: 3 }, // H
  { x: 27, y: 51, w: 20, rot: -5 }, // V
  { x: 45, y: 49, w: 34, rot: 2 }, // H
  { x: 40, y: 74, w: 19, rot: 4 }, // V
  { x: 58, y: 70, w: 30, rot: -3 }, // H
  { x: 3, y: 80, w: 33, rot: -2 }, // H
  { x: 81, y: 62, w: 18, rot: 3 }, // V
  { x: 57, y: 92, w: 32, rot: 4 }, // H
  { x: 17, y: 101, w: 36, rot: -3 }, // H
];

const PEGATINAS_ESCRITORIO = [
  { texto: "One code", x: 70, y: 22, rot: -8, estilo: "rosa" },
  { texto: "One dancefloor", x: 6, y: 51, rot: 6, estilo: "negro" },
  { texto: "Kodigo Klub", x: 63, y: 117, rot: -4, estilo: "rosa" },
  { texto: "✦", x: 48, y: 25, rot: 0, estilo: "estrella" },
  { texto: "✦", x: 22, y: 76, rot: 0, estilo: "estrella" },
  { texto: "✦", x: 92, y: 96, rot: 0, estilo: "estrella" },
] as const;

function alto(foto: Foto, w: number) {
  return foto.vertical ? w * 1.5 : w / 1.5;
}

/** Móvil (o fotos de más): zigzag a dos alturas que se solapan. */
function piezasZigzag(fotos: Foto[]) {
  let y = 2;
  const piezas = fotos.map((foto, i) => {
    const w = foto.vertical ? 54 : 68;
    const izquierda = i % 2 === 0;
    const x = izquierda ? 2 + (i % 3) * 2 : 100 - w - 2 - (i % 3) * 2;
    const pieza = { x, y, w, rot: (izquierda ? -1 : 1) * (2 + (i % 3) * 1.5) };
    y += alto(foto, w) * 0.62;
    return pieza;
  });
  const ultima = fotos.length - 1;
  const altoTotal = ultima >= 0 ? piezas[ultima].y + alto(fotos[ultima], piezas[ultima].w) + 4 : 0;
  return { piezas, altoTotal };
}

function MarcoFoto({ foto, marco, sizes }: { foto: Foto; marco: Marco; sizes: string }) {
  const ratio = foto.vertical ? "aspect-[2/3]" : "aspect-[3/2]";

  const imagen = (
    <div className={`relative w-full overflow-hidden ${ratio}`}>
      <Image src={foto.src} alt="Kodigo Klub — 1ª edición" fill sizes={sizes} className="object-cover" />
    </div>
  );

  if (marco === "polaroid" || marco === "cinta") {
    return (
      <div className="relative bg-[#f4f1ea] p-[5%] pb-[14%] shadow-2xl shadow-black/70">
        {marco === "cinta" && (
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-6 w-1/3 -translate-x-1/2 -rotate-3 bg-[#d6127e]/70 mix-blend-screen"
          />
        )}
        {imagen}
      </div>
    );
  }
  if (marco === "magenta") {
    return (
      <div className="border-[6px] border-[#d6127e] shadow-[0_0_30px_rgba(214,18,126,0.45)]">{imagen}</div>
    );
  }
  return <div className="overflow-hidden rounded-sm shadow-2xl shadow-black/70 grayscale-[30%]">{imagen}</div>;
}

function Lienzo({
  fotos,
  piezas,
  altoLienzo,
  pegatinas,
  sizes,
  onAbrir,
}: {
  fotos: Foto[];
  piezas: Pieza[];
  altoLienzo: number;
  pegatinas: readonly { texto: string; x: number; y: number; rot: number; estilo: string }[];
  sizes: string;
  onAbrir: (i: number) => void;
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio: `100 / ${altoLienzo}` }}>
      {fotos.map((foto, i) => {
        const p = piezas[i];
        return (
          <motion.button
            key={foto.src}
            type="button"
            onClick={() => onAbrir(i)}
            aria-label={`Ver foto ${i + 1}`}
            className="absolute block cursor-zoom-in"
            style={{
              left: `${p.x}%`,
              top: `${(p.y / altoLienzo) * 100}%`,
              width: `${p.w}%`,
              zIndex: 10 + (i % 5),
            }}
            initial={{ opacity: 0, y: 40, rotate: p.rot * 2.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: p.rot }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: (i % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ rotate: 0, scale: 1.07, zIndex: 60, transition: { duration: 0.25 } }}
          >
            <MarcoFoto foto={foto} marco={p.marco} sizes={sizes} />
          </motion.button>
        );
      })}

      {pegatinas.map((pg) => (
        <span
          key={`${pg.texto}-${pg.x}-${pg.y}`}
          aria-hidden
          className={`pointer-events-none absolute z-40 select-none whitespace-nowrap font-black uppercase ${
            pg.estilo === "estrella"
              ? "text-4xl text-[#d6127e] [text-shadow:0_0_18px_rgba(214,18,126,0.8)] md:text-6xl"
              : pg.estilo === "rosa"
                ? "bg-[#d6127e] px-3 py-1 text-sm tracking-[0.15em] text-black md:text-lg"
                : "border-2 border-[#d6127e] bg-black px-3 py-1 text-sm tracking-[0.15em] text-white md:text-lg"
          }`}
          style={{
            left: `${pg.x}%`,
            top: `${(pg.y / altoLienzo) * 100}%`,
            transform: `rotate(${pg.rot}deg)`,
          }}
        >
          {pg.texto}
        </span>
      ))}
    </div>
  );
}

export default function CollageAbstracto({ fotos }: { fotos: Foto[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  // Escritorio: composición a mano; si hay más fotos que piezas, el resto
  // continúa en zigzag debajo.
  const piezasEscritorio: Pieza[] = fotos.map((_, i) => {
    const base = PIEZAS_ESCRITORIO[i];
    return { ...(base ?? { x: (i % 3) * 33, y: LIENZO_ALTO + Math.floor((i - PIEZAS_ESCRITORIO.length) / 3) * 25, w: 30, rot: (i % 2 ? 3 : -3) }), marco: MARCOS[i % MARCOS.length] };
  });
  const extraFilas = Math.max(0, Math.ceil((fotos.length - PIEZAS_ESCRITORIO.length) / 3));
  const altoEscritorio = LIENZO_ALTO + extraFilas * 25;

  const movil = piezasZigzag(fotos);
  const piezasMovil: Pieza[] = movil.piezas.map((p, i) => ({ ...p, marco: MARCOS[i % MARCOS.length] }));
  const pegatinasMovil = [
    { texto: "One code", x: 52, y: movil.altoTotal * 0.18, rot: -8, estilo: "rosa" },
    { texto: "One dancefloor", x: 4, y: movil.altoTotal * 0.52, rot: 6, estilo: "negro" },
    { texto: "✦", x: 84, y: movil.altoTotal * 0.78, rot: 0, estilo: "estrella" },
  ];

  if (fotos.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-black px-4 pb-20 pt-4 md:px-12 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 30% at 20% 20%, rgba(214,18,126,0.28), transparent 70%), radial-gradient(35% 25% at 85% 60%, rgba(156,30,83,0.35), transparent 70%), radial-gradient(30% 20% at 40% 95%, rgba(214,18,126,0.22), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="hidden md:block">
          <Lienzo
            fotos={fotos}
            piezas={piezasEscritorio}
            altoLienzo={altoEscritorio}
            pegatinas={PEGATINAS_ESCRITORIO}
            sizes="(max-width: 1200px) 36vw, 420px"
            onAbrir={setAbierta}
          />
        </div>
        <div className="md:hidden">
          <Lienzo
            fotos={fotos}
            piezas={piezasMovil}
            altoLienzo={movil.altoTotal}
            pegatinas={pegatinasMovil}
            sizes="70vw"
            onAbrir={setAbierta}
          />
        </div>
      </div>

      {abierta !== null && (
        <GaleriaLightbox
          images={fotos.map((f) => f.src)}
          initialIndex={abierta}
          onClose={() => setAbierta(null)}
        />
      )}
    </section>
  );
}
