"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Euro, ImagePlus, Package, X } from "lucide-react";
import ProductoCard from "@/app/components/merch/ProductoCard";
import { useAuth } from "../_components/AuthProvider";
import { BarraCesta, ModalCesta, useCesta } from "../_components/CestaMerch";
import { EditarFotos, EditarPrecios, PedidosMerch, useFotosMerch, usePreciosMerch } from "../_components/AdminMerch";
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
const PRECIOS_BASE = Object.fromEntries(productos.map((p) => [p.id, p.precio])) as { camiseta: number; pantalon: number; pack: number };

export default function PaginaMerch() {
  const { esEditor } = useAuth();
  const [abierta, setAbierta] = useState<number | null>(null);
  const cesta = useCesta();
  const [verCesta, setVerCesta] = useState(false);
  const [panel, setPanel] = useState<"pedidos" | "precios" | "fotos" | null>(null);
  const { precios, recargar: recargarPrecios } = usePreciosMerch(PRECIOS_BASE);
  const { fotos: FOTOS_VISTAS, propias, recargar: recargarFotos } = useFotosMerch(FOTOS);

  // Precios de la app; el "antes" del pack es camiseta + pantalón.
  const lista = PRODUCTOS.map((p) => ({
    ...p,
    precio: precios[p.id as keyof typeof precios] ?? p.precio,
    precioAnterior: p.id === "pack" ? precios.camiseta + precios.pantalon : p.precioAnterior,
    detalles: p.id === "pack" ? p.detalles.map((d) => (/^Ahorras/.test(d) ? `Ahorras ${precios.camiseta + precios.pantalon - precios.pack} €` : d)) : p.detalles,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kanot-pink">Nuevo · Temporada 26/27</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">Merch</h1>
      </div>

      {esEditor && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pedidos", "Pedidos", Package],
              ["precios", "Precios", Euro],
              ["fotos", "Fotos", ImagePlus],
            ] as const
          ).map(([id, nombre, Icono]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
            >
              <Icono size={14} /> {nombre}
            </button>
          ))}
        </div>
      )}

      {/* Fotos deslizables */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FOTOS_VISTAS.map((f, i) => (
          <button
            key={f.src}
            type="button"
            onClick={() => setAbierta(i)}
            aria-label={`Ver foto: ${f.alt}`}
            className="relative aspect-[4/5] w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 sm:w-48"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pueden ser fotos subidas a Supabase */}
            <img src={f.src} alt={f.alt} loading={i < 2 ? "eager" : "lazy"} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>


      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">Elige tu talla y añádelo a la cesta</h2>
        {lista.map((p) => (
          <ProductoCard key={p.id} producto={p} onAnadir={cesta.anadir} />
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

      {/* Hueco para que la barra de la cesta no tape lo último */}
      {cesta.lineas.length > 0 && <div className="h-16" />}
      <BarraCesta lineas={cesta.lineas} onAbrir={() => setVerCesta(true)} />
      {verCesta && (
        <ModalCesta
          lineas={cesta.lineas}
          onQuitar={cesta.quitar}
          onEnviado={() => {
            cesta.vaciar();
            setVerCesta(false);
          }}
          onCerrar={() => setVerCesta(false)}
        />
      )}
      {panel === "pedidos" && <PedidosMerch onCerrar={() => setPanel(null)} />}
      {panel === "precios" && (
        <EditarPrecios
          precios={precios}
          onCerrar={() => setPanel(null)}
          onGuardado={() => {
            recargarPrecios();
            setPanel(null);
          }}
        />
      )}
      {panel === "fotos" && <EditarFotos fotos={FOTOS_VISTAS} propias={propias} onCerrar={() => setPanel(null)} onCambio={recargarFotos} />}

      {abierta !== null && abierta >= 0 && FOTOS_VISTAS[abierta] && (
        <div className="tema-fijo fixed inset-0 z-50 flex flex-col bg-black/95" onClick={() => setAbierta(null)}>
          <div className="flex justify-end p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="rounded-full p-2 hover:bg-white/10">
              <X size={22} />
            </button>
          </div>
          <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- pueden ser fotos subidas a Supabase */}
            <img src={FOTOS_VISTAS[abierta].src} alt={FOTOS_VISTAS[abierta].alt} className="absolute inset-0 h-full w-full object-contain p-4" />
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => setAbierta((abierta - 1 + FOTOS_VISTAS.length) % FOTOS_VISTAS.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              onClick={() => setAbierta((abierta + 1) % FOTOS_VISTAS.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <p className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-sm text-white/70">{FOTOS_VISTAS[abierta].alt}</p>
        </div>
      )}
    </div>
  );
}
