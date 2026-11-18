"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhotoCarousel from "@/app/components/kodigoklub/PhotoCarousel";
import CollageAbstracto from "@/app/components/kodigoklub/CollageAbstracto";
import PosterGallery from "@/app/components/kodigoklub/PosterGallery";
import UneteKodigo from "@/app/components/kodigoklub/UneteKodigo";
import ComoLlegar from "@/app/components/kodigoklub/ComoLlegar";
import { Disc3 } from "lucide-react";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import {
  KODIGO_KLUB_INSTAGRAM_HREF,
  edicionPorDefecto,
  edicionesOrdenadas,
  nombreEdicion,
} from "@/app/data/kodigoKlub";

export default function EdicionesKodigo() {
  const [numero, setNumero] = useState(edicionPorDefecto.numero);
  const edicion = edicionesOrdenadas.find((e) => e.numero === numero) ?? edicionesOrdenadas[0];
  const etiqueta = nombreEdicion(edicion.numero);

  return (
    <>
      <section id="ediciones" className="scroll-mt-6 bg-black px-6 pt-14 pb-10 md:px-12 md:pt-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9c9d6]">Ediciones</p>

          <div role="tablist" aria-label="Ediciones de Kodigo Klub" className="flex flex-wrap justify-center gap-2">
            {[...edicionesOrdenadas].reverse().map((e) => {
              const activa = e.numero === edicion.numero;
              return (
                <button
                  key={e.numero}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  onClick={() => setNumero(e.numero)}
                  className={`rounded-full border px-5 py-2 text-sm font-black uppercase tracking-wider transition-colors ${
                    activa
                      ? "border-[#d6127e] bg-[#d6127e] text-black shadow-[0_0_20px_rgba(214,18,126,0.45)]"
                      : "border-white/20 text-white/80 hover:border-[#d6127e] hover:text-[#d6127e]"
                  }`}
                >
                  {nombreEdicion(e.numero)}
                  {e.proximamente && (
                    <span className={`ml-2 text-[10px] tracking-[0.15em] ${activa ? "text-black/70" : "text-[#d6127e]"}`}>
                      Pronto
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={edicion.numero}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
                {etiqueta}
              </h2>
              {edicion.fecha && (
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#d6127e]">
                  {edicion.fecha}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {edicion.proximamente ? (
        <Proximamente key={edicion.numero} etiqueta={etiqueta} />
      ) : (
        <div key={edicion.numero}>
          {edicion.collage && <CollageAbstracto fotos={edicion.collage} />}
          <PhotoCarousel photos={edicion.fotos} etiqueta={etiqueta} />
          <PosterGallery posters={edicion.invitadxs} etiqueta={etiqueta} />
          {!edicion.finalizada && (
            <>
              <UneteKodigo entradasHref={edicion.entradasHref} />
              <ComoLlegar sala={edicion.sala} />
            </>
          )}
        </div>
      )}
    </>
  );
}

function Proximamente({ etiqueta }: { etiqueta: string }) {
  return (
    <section
      className="px-6 py-14 md:px-12 md:py-20"
      style={{
        backgroundColor: "#120010",
        backgroundImage: "repeating-conic-gradient(#0a0a0a 0% 25%, #9c1e53 0% 50%)",
        backgroundSize: "36px 36px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-[#d6127e]/30 bg-black/90 px-6 py-16 text-center shadow-2xl shadow-black/60 md:py-24"
      >
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="flex text-[#d6127e]"
        >
          <Disc3 className="h-14 w-14 md:h-16 md:w-16" />
        </motion.span>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9c9d6]">
          Kodigo Klub · {etiqueta}
        </p>
        <h3 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
          Próximamente
        </h3>
        <p className="max-w-md text-sm text-white/70 md:text-base">
          Estamos preparando la siguiente edición. Fecha, invitadxs y entradas, muy pronto en
          nuestro Instagram.
        </p>
        <a
          href={KODIGO_KLUB_INSTAGRAM_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#d6127e] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-white"
        >
          <InstagramIcon className="h-4 w-4" />
          Síguenos en @KodigoKlub
        </a>
      </motion.div>
    </section>
  );
}
