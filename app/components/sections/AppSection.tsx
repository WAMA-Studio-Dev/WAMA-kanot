"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, Download, Ticket, Trophy, Shirt } from "lucide-react";
import { fadeUpVariants, REVEAL_TRANSITION } from "@/app/lib/motion";

const VENTAJAS = [
  { icono: CalendarClock, texto: "Horarios de ensayo de tu grupo" },
  { icono: Trophy, texto: "Competiciones y autorizaciones" },
  { icono: Ticket, texto: "Entradas de Kodigo Klub" },
  { icono: Shirt, texto: "Merch, Kanot Kamp y podcast" },
];

/** Sección de la portada que invita a abrir e instalar la app ByKanot. */
export default function AppSection() {
  return (
    <section id="app" className="scroll-mt-28 bg-kanot-navy-deep px-6 py-20 md:px-12 lg:px-20">
      <motion.div
        className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-kanot-pink/20 via-transparent to-kanot-electric/20 p-8 md:grid-cols-[1fr_auto] md:p-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUpVariants}
        transition={REVEAL_TRANSITION}
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-kanot-pink-soft">Nuevo</p>
            <h2 className="text-4xl font-black uppercase tracking-tight text-kanot-pink sm:text-5xl">La app ByKanot</h2>
            <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
              Todo Kanot en tu móvil. Sin App Store ni Google Play: se instala desde el navegador en un momento.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {VENTAJAS.map((v) => (
              <li key={v.texto} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-kanot-pink">
                  <v.icono size={18} />
                </span>
                {v.texto}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-kanot-pink px-6 py-3 text-sm font-bold text-kanot-navy shadow-lg shadow-kanot-pink/30 transition-colors hover:bg-white"
            >
              <Download size={18} /> Abrir y descargar la app
            </Link>
          </div>
          <p className="text-xs text-white/50">
            Crea tu cuenta y el equipo de Kanot te dará acceso. Dentro, pulsa “Descargar la app” para tenerla en tu
            pantalla de inicio.
          </p>
        </div>

        {/* Icono de la app, como se verá en el móvil */}
        <div className="flex flex-col items-center gap-3 justify-self-center">
          <div className="rounded-[2.2rem] bg-white/5 p-5 shadow-2xl shadow-black/40 ring-1 ring-white/10">
            <Image
              src="/app-icons/icon-512.png"
              alt="Icono de la app ByKanot"
              width={160}
              height={160}
              className="h-32 w-32 rounded-[1.8rem] md:h-40 md:w-40"
            />
          </div>
          <span className="text-sm font-semibold text-white/80">ByKanot</span>
        </div>
      </motion.div>
    </section>
  );
}
