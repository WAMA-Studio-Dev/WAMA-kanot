"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { Banknote, Disc3, ExternalLink, Globe, Images, Info, MapPin, Ticket } from "lucide-react";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import {
  KODIGO_KLUB_DESCRIPCION,
  KODIGO_KLUB_INSTAGRAM_HREF,
  edicionPorDefecto,
  edicionesOrdenadas,
  nombreEdicion,
  type KodigoEdicion,
  type KodigoSala,
} from "@/app/data/kodigoKlub";
import VistaSeccion from "../_components/VistaSeccion";
import Pestanas, { usePestanaActiva } from "../_components/Pestanas";
import { Cargando } from "../_components/ui";
import { fechaWebAISO } from "../_components/EstaSemana";

const PESTANAS = [
  { id: "que-es", nombre: "Qué es", icono: Info },
  { id: "ediciones", nombre: "Ediciones", icono: Images },
  { id: "entradas", nombre: "Entradas", icono: Ticket },
] as const;

/** Edición con entradas a la venta (ni finalizada ni "próximamente"), si la hay. */
const EDICION_A_LA_VENTA = edicionesOrdenadas.find((e) => !e.proximamente && !e.finalizada && e.entradasHref);
/** La siguiente edición anunciada, para avisar en Entradas. */
const PROXIMA = edicionesOrdenadas.find((e) => e.proximamente);
/** Edición con las dos formas de compra (efectivo / Forvenues). */
const CON_VENTA = [...edicionesOrdenadas].reverse().find((e) => !e.finalizada && (e.ventaEfectivo || e.forvenuesHref !== undefined));

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

      <CuentaAtrasKodigo />

      <Pestanas pestanas={PESTANAS} activa={activa} />

      {activa === "que-es" && <QueEs />}
      {activa === "ediciones" && <Ediciones />}
      {activa === "entradas" && <Entradas />}
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

      <BotonInstagram />
    </div>
  );
}

function Ediciones() {
  const [numero, setNumero] = useState(edicionPorDefecto.numero);
  const edicion = edicionesOrdenadas.find((e) => e.numero === numero) ?? edicionesOrdenadas[0];

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Ediciones" className="flex flex-wrap justify-center gap-2">
        {[...edicionesOrdenadas].reverse().map((e) => {
          const activa = e.numero === edicion.numero;
          return (
            <button
              key={e.numero}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setNumero(e.numero)}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                activa
                  ? "border-[#d6127e] bg-[#d6127e] text-black"
                  : "border-white/20 text-white/80 hover:border-[#d6127e] hover:text-[#ff5fb0]"
              }`}
            >
              {nombreEdicion(e.numero)}
              {e.proximamente && (
                <span className={`ml-1.5 text-[10px] ${activa ? "text-black/70" : "text-[#ff5fb0]"}`}>Pronto</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight">{nombreEdicion(edicion.numero)}</h2>
        {edicion.fecha && (
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5fb0]">{edicion.fecha}</p>
        )}
      </div>

      {edicion.proximamente ? <Proximamente /> : <ContenidoEdicion edicion={edicion} />}
    </div>
  );
}

function ContenidoEdicion({ edicion }: { edicion: KodigoEdicion }) {
  const fotos = edicion.collage?.map((f) => f.src) ?? edicion.fotos;

  return (
    <div className="flex flex-col gap-6">
      {fotos.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">Fotos</h3>
          {/* Carrusel deslizable, a sangre en móvil */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {fotos.map((src) => (
              <div key={src} className="relative aspect-[4/5] w-[70%] shrink-0 snap-center overflow-hidden rounded-2xl sm:w-[40%]">
                <Image src={src} alt="" fill sizes="(max-width: 640px) 70vw, 40vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {edicion.invitadxs.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">Invitadxs</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {edicion.invitadxs.map((p) => (
              <div key={p.src} className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg shadow-black/40">
                <Image src={p.src} alt={p.alt} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {edicion.finalizada ? (
        <p className="rounded-2xl bg-white/5 p-4 text-center text-sm text-white/60">
          Esta edición ya se celebró. ¡Gracias por venir! 🖤
        </p>
      ) : (
        <ComoLlegar sala={edicion.sala} />
      )}
    </div>
  );
}

function Proximamente() {
  return (
    <div
      className="rounded-3xl p-3"
      style={{
        backgroundColor: "#120010",
        backgroundImage: "repeating-conic-gradient(#0a0a0a 0% 25%, #9c1e53 0% 50%)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-black/90 px-5 py-10 text-center">
        <Disc3 className="h-12 w-12 animate-spin text-[#d6127e] [animation-duration:6s]" />
        <h3 className="text-3xl font-black uppercase tracking-tight">Próximamente</h3>
        <p className="max-w-sm text-sm text-white/70">
          Estamos preparando la siguiente edición. Fecha, invitadxs y entradas, muy pronto en nuestro Instagram.
        </p>
        <BotonInstagram />
      </div>
    </div>
  );
}

function Entradas() {
  return (
    <div className="flex flex-col gap-5">
      {CON_VENTA ? (
        <OpcionesCompra edicion={CON_VENTA} />
      ) : EDICION_A_LA_VENTA ? (
        <>
          <a
            href={EDICION_A_LA_VENTA.entradasHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#d6127e] px-5 py-4 font-bold text-white shadow-lg shadow-[#d6127e]/30 transition hover:bg-[#9c1e53]"
          >
            <Ticket size={20} /> Comprar entradas · {nombreEdicion(EDICION_A_LA_VENTA.numero)}
            <ExternalLink size={16} className="opacity-70" />
          </a>
          <ComoLlegar sala={EDICION_A_LA_VENTA.sala} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#d6127e]/30 bg-[#9c1e53]/25 p-6 text-center">
          <Ticket className="text-[#ff5fb0]" size={28} />
          <p className="font-bold">
            {PROXIMA ? `Las entradas de la ${nombreEdicion(PROXIMA.numero)} saldrán pronto` : "Ahora mismo no hay entradas a la venta"}
          </p>
          <p className="text-sm text-white/65">Te avisamos en Instagram en cuanto estén disponibles.</p>
          <BotonInstagram />
        </div>
      )}

      <h2 className="mt-2 text-sm font-semibold uppercase tracking-widest text-white/60">Próximos eventos</h2>
      <VistaSeccion slug="kodigo-klub" compacto />
    </div>
  );
}

function ComoLlegar({ sala }: { sala: KodigoSala }) {
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${sala.nombre}, ${sala.direccion}`)}`;
  return (
    <section className="rounded-3xl bg-[#9c1e53] p-5">
      <h3 className="text-lg font-black uppercase tracking-tight">¿Cómo llegar?</h3>
      <p className="mt-2 flex items-center gap-1.5 font-bold">
        <MapPin size={16} /> {sala.nombre} · {sala.ciudad}
      </p>
      <p className="mt-1 text-sm text-white/80">{sala.direccion}</p>
      <a
        href={mapa}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold transition hover:bg-kanot-navy-deep"
      >
        Abrir en Google Maps <ExternalLink size={14} />
      </a>
    </section>
  );
}

function BotonInstagram() {
  return (
    <a
      href={KODIGO_KLUB_INSTAGRAM_HREF}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3.5 font-semibold transition hover:bg-white/10"
    >
      <InstagramIcon className="h-5 w-5" /> @kodigoklub
    </a>
  );
}

/** Dos formas de comprar: en efectivo (fechas y lugar) u online en Forvenues. */
function OpcionesCompra({ edicion }: { edicion: KodigoEdicion }) {
  const efectivo = edicion.ventaEfectivo;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Entradas · {nombreEdicion(edicion.numero)}</h2>
        {edicion.fecha && <p className="text-sm font-semibold text-[#ff5fb0]">{edicion.fecha}</p>}
      </div>

      {/* Opción 1: efectivo */}
      {efectivo && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="flex items-center gap-2 font-bold">
            <Banknote size={18} className="text-[#ff5fb0]" /> En efectivo
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/75">
            <MapPin size={14} /> {efectivo.lugar}
          </p>
          {efectivo.fechas.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1.5">
              {efectivo.fechas.map((f) => (
                <li key={f} className="rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold">
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/60">Fechas de venta: próximamente</p>
          )}
        </section>
      )}

      {/* Opción 2: online */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <p className="flex items-center gap-2 font-bold">
          <Globe size={18} className="text-[#ff5fb0]" /> Online · Forvenues
        </p>
        {edicion.forvenuesHref ? (
          <a
            href={edicion.forvenuesHref}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[#d6127e] px-5 py-3.5 font-bold text-white shadow-lg shadow-[#d6127e]/30 transition hover:bg-[#9c1e53]"
          >
            <Ticket size={18} /> Comprar online <ExternalLink size={15} className="opacity-70" />
          </a>
        ) : (
          <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/60">Enlace de compra: próximamente</p>
        )}
      </section>

      {/* El lugar de esta edición todavía no está confirmado */}
      <p className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/60">
        <MapPin size={14} className="mr-1 inline -translate-y-0.5" /> Lugar del evento: próximamente
      </p>
    </div>
  );
}

/** "Faltan X días" para la próxima edición (solo si ya tiene fecha). */
function CuentaAtrasKodigo() {
  const proxima = [...edicionesOrdenadas].reverse().find((e) => !e.finalizada && e.fecha);
  const iso = proxima?.fecha ? fechaWebAISO(proxima.fecha) : null;
  if (!proxima || !iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const hoy = new Date();
  const dias = Math.round((new Date(y, m - 1, d).getTime() - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()) / 86400000);
  if (dias < 0) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#ff5fb0]/40 bg-[#ff5fb0]/10 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ff5fb0]">Próxima edición</p>
        <p className="truncate text-sm font-bold">
          {nombreEdicion(proxima.numero)} · {proxima.fecha}
        </p>
      </div>
      <p className="shrink-0 text-right leading-none">
        {dias === 0 ? (
          <span className="text-xl font-black text-[#ff5fb0]">¡Hoy!</span>
        ) : (
          <>
            <span className="block text-3xl font-black tabular-nums text-[#ff5fb0]">{dias}</span>
            <span className="text-[11px] font-semibold text-white/60">{dias === 1 ? "día" : "días"}</span>
          </>
        )}
      </p>
    </div>
  );
}
