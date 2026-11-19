"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import GlassCard from "@/app/components/ui/GlassCard";
import { WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import { TALLAS, whatsappUrl, type GrupoTallas, type Producto } from "@/app/data/merch";

function SelectorTallas({
  titulo,
  grupos,
  valor,
  onChange,
}: {
  titulo?: string;
  grupos: GrupoTallas[];
  valor: string | null;
  onChange: (talla: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {titulo && <p className="text-sm font-semibold text-white">{titulo}</p>}
      {grupos.map((grupo) => (
        <div key={grupo.etiqueta}>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Talla {grupo.etiqueta.toLowerCase()}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grupo.tallas.map((talla) => {
              const id = `${grupo.etiqueta} ${talla}`;
              const activa = valor === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange(activa ? null : id)}
                  title={activa ? "Quitar talla" : undefined}
                  aria-pressed={activa}
                  className={`min-w-10 rounded-full border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                    activa
                      ? "border-kanot-pink bg-kanot-pink text-kanot-navy"
                      : "border-white/15 text-white/80 hover:border-kanot-pink/50 hover:text-kanot-pink"
                  }`}
                >
                  {talla}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function tallaTexto(id: string) {
  const [grupo, ...resto] = id.split(" ");
  return `${resto.join(" ")} (${grupo.toLowerCase()})`;
}

/** Una línea de la cesta (app). */
export type LineaCesta = { id: string; producto: string; detalle: string; precio: number };

export default function ProductoCard({
  producto,
  onAnadir,
}: {
  producto: Producto;
  /** En la app: en vez de reservar directamente, se añade a la cesta. */
  onAnadir?: (linea: LineaCesta) => void;
}) {
  const [anadido, setAnadido] = useState(false);
  const esPack = producto.id === "pack";
  const [talla, setTalla] = useState<string | null>(null);
  const [tallaCamiseta, setTallaCamiseta] = useState<string | null>(null);
  const [tallaPantalon, setTallaPantalon] = useState<string | null>(null);

  const listo = esPack ? Boolean(tallaCamiseta && tallaPantalon) : Boolean(talla);

  const mensaje = esPack
    ? `¡Hola! Quiero reservar el pack completo (${producto.precio} €): camiseta talla ${
        tallaCamiseta ? tallaTexto(tallaCamiseta) : "?"
      } y pantalón talla ${tallaPantalon ? tallaTexto(tallaPantalon) : "?"}.`
    : `¡Hola! Quiero reservar ${producto.articulo} ${producto.nombre.toLowerCase()} (${producto.precio} €) en talla ${
        talla ? tallaTexto(talla) : "?"
      }.`;

  return (
    <GlassCard
      className={`flex h-full flex-col ${
        producto.destacado ? "ring-2 ring-kanot-pink/60" : ""
      }`}
    >
      <div className="flex flex-1 flex-col gap-5 p-6 md:p-7">
        {producto.destacado && (
          <span className="w-fit rounded-full bg-kanot-pink px-3 py-1 text-[11px] font-black uppercase tracking-wider text-kanot-navy">
            Ahorra {producto.precioAnterior! - producto.precio} €
          </span>
        )}
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h3 className="text-2xl font-black uppercase tracking-tight text-kanot-pink">
            {producto.nombre}
          </h3>
          <p className="flex items-baseline gap-2 whitespace-nowrap">
            {producto.precioAnterior && (
              <span className="text-base font-semibold text-white/40 line-through">
                {producto.precioAnterior} €
              </span>
            )}
            <span className="text-3xl font-black text-white">{producto.precio} €</span>
          </p>
        </div>

        <p className="text-sm text-white/70">{producto.descripcion}</p>

        <ul className="flex flex-col gap-1.5">
          {producto.detalles.map((d) => (
            <li key={d} className="flex items-center gap-2 text-sm text-white/80">
              <Check className="h-4 w-4 shrink-0 text-kanot-pink" />
              {d}
            </li>
          ))}
        </ul>

        <div className="border-t border-white/10 pt-5">
          {esPack ? (
            <div className="flex flex-col gap-5">
              <SelectorTallas
                titulo="Camiseta"
                grupos={TALLAS.camiseta}
                valor={tallaCamiseta}
                onChange={setTallaCamiseta}
              />
              <SelectorTallas
                titulo="Pantalón"
                grupos={TALLAS.pantalon}
                valor={tallaPantalon}
                onChange={setTallaPantalon}
              />
            </div>
          ) : (
            <SelectorTallas grupos={producto.tallas} valor={talla} onChange={setTalla} />
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          {listo && onAnadir ? (
            <button
              type="button"
              onClick={() => {
                onAnadir({
                  id: `${producto.id}-${Date.now()}`,
                  producto: producto.nombre,
                  detalle: esPack
                    ? `camiseta ${tallaTexto(tallaCamiseta!)} + pantalón ${tallaTexto(tallaPantalon!)}`
                    : `talla ${tallaTexto(talla!)}`,
                  precio: producto.precio,
                });
                setTalla(null);
                setTallaCamiseta(null);
                setTallaPantalon(null);
                setAnadido(true);
                setTimeout(() => setAnadido(false), 2000);
              }}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-kanot-pink px-4 py-3 text-sm font-bold text-kanot-navy transition-colors hover:bg-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Añadir a la cesta
            </button>
          ) : anadido ? (
            <span className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-300">
              <Check className="h-4 w-4" /> Añadido a la cesta
            </span>
          ) : listo ? (
            <a
              href={whatsappUrl(mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-kanot-pink px-4 py-3 text-sm font-bold text-kanot-navy transition-colors hover:bg-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Reservar por WhatsApp
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="flex cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white/40"
            >
              {onAnadir ? <ShoppingBag className="h-4 w-4" /> : <WhatsAppIcon className="h-4 w-4" />}
              {esPack ? "Elige las dos tallas" : "Elige tu talla"}
            </span>
          )}
          <p className="text-center text-xs text-white/50">
            {onAnadir
              ? "Puedes añadir varias prendas y enviarlo todo junto."
              : listo
                ? "Se abre WhatsApp con tu pedido ya escrito."
                : "Te preparamos el mensaje de WhatsApp con tu talla."}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
