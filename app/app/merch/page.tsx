"use client";

import Image from "next/image";
import ProductoCard from "@/app/components/merch/ProductoCard";
import { InstagramIcon, WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import { MERCH_INSTAGRAM, MERCH_INSTAGRAM_DM, productos, whatsappUrl } from "@/app/data/merch";

const FOTOS = [
  { src: "/imagenes/merch/camiseta-detalle.jpg", alt: "Detalle del escudo en la camiseta" },
  { src: "/imagenes/merch/pantalon.jpg", alt: "Pantalón ByKanot" },
  { src: "/imagenes/merch/camiseta-espalda.jpg", alt: "Espalda de la camiseta con el logo KANOT" },
  { src: "/imagenes/merch/camiseta-doblada.jpg", alt: "Camisetas ByKanot dobladas" },
  { src: "/imagenes/merch/cartel-merch.jpg", alt: "Cartel del merch con precios y tallas" },
];

const MENSAJE_DUDAS = "¡Hola! Tengo una duda sobre el merch de ByKanot.";

// El pack primero: es la mejor oferta.
const PRODUCTOS = [...productos].sort((a, b) => Number(!!b.destacado) - Number(!!a.destacado));

export default function PaginaMerch() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kanot-pink">Nuevo · Temporada 26/27</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">Merch</h1>
      </div>

      {/* Fotos deslizables */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FOTOS.map((f, i) => (
          <div
            key={f.src}
            className="relative aspect-[4/5] w-28 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 sm:w-36"
          >
            <Image src={f.src} alt={f.alt} fill priority={i === 0} sizes="144px" className="object-cover" />
          </div>
        ))}
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {[
          { k: "Camiseta", v: "15 €" },
          { k: "Pantalón", v: "25 €" },
          { k: "Pack", v: "35 €", destacado: true },
        ].map((item) => (
          <div
            key={item.k}
            className={`rounded-2xl border px-3 py-2.5 ${
              item.destacado ? "border-kanot-pink/60 bg-kanot-pink/10" : "border-white/10 bg-black/20"
            }`}
          >
            <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">{item.k}</dt>
            <dd className={`text-xl font-black ${item.destacado ? "text-kanot-pink" : "text-white"}`}>{item.v}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Elige tu talla y reserva</h2>
        {PRODUCTOS.map((p) => (
          <ProductoCard key={p.id} producto={p} />
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-gradient-to-br from-kanot-pink/15 to-kanot-electric/15 p-5">
        <h2 className="text-xl font-black uppercase tracking-tight text-kanot-pink">¿Dudas con la talla?</h2>
        <p className="text-sm text-white/80">
          Escríbenos por WhatsApp al <strong className="text-white">679 507 935</strong> o a{" "}
          <strong className="text-white">@{MERCH_INSTAGRAM}</strong> en Instagram.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={whatsappUrl(MENSAJE_DUDAS)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-kanot-pink px-4 py-3 text-sm font-bold text-kanot-navy-deep transition hover:bg-white"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href={MERCH_INSTAGRAM_DM}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            <InstagramIcon className="h-4 w-4" /> @{MERCH_INSTAGRAM}
          </a>
        </div>
      </section>
    </div>
  );
}
