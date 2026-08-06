"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { equipos, type Equipo } from "@/app/data/equipos";
import ScrollReveal from "@/app/components/ui/ScrollReveal";

const TRANSITION_MS = 650;
const EASE_CSS = "cubic-bezier(0.4, 0, 0.2, 1)";
const CARD_TRANSITION_CSS = `left ${TRANSITION_MS}ms ${EASE_CSS}, bottom ${TRANSITION_MS}ms ${EASE_CSS}, height ${TRANSITION_MS}ms ${EASE_CSS}, transform ${TRANSITION_MS}ms ${EASE_CSS}, filter ${TRANSITION_MS}ms ${EASE_CSS}, opacity ${TRANSITION_MS}ms ${EASE_CSS}`;

const BACKGROUND_COLORS = ["#0b2b6b", "#082054", "#12184f", "#170f3d"];

type Role = "center" | "left" | "right" | "back";

function getRole(index: number, activeIndex: number, total: number): Role {
  const diff = ((index - activeIndex) % total + total) % total;
  if (diff === 0) return "center";
  if (diff === 1) return "right";
  if (diff === total - 1) return "left";
  return "back";
}

// Base height % is chosen so that, once multiplied by `scale`, the card never
// exceeds ~92% of the stage height — keeps the center figure inside the frame
// (transform-origin is bottom-center, so it only ever grows upward).
function getRoleStyle(role: Role, isMobile: boolean) {
  switch (role) {
    case "center":
      return {
        scale: isMobile ? 1.15 : 1.3,
        blur: 0,
        opacity: 1,
        zIndex: 20,
        left: "50%",
        height: isMobile ? "70%" : "70%",
        bottom: isMobile ? "10%" : "6%",
      };
    case "left":
      return {
        scale: 1,
        blur: 2,
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? "20%" : "30%",
        height: isMobile ? "16%" : "28%",
        bottom: isMobile ? "32%" : "12%",
      };
    case "right":
      return {
        scale: 1,
        blur: 2,
        opacity: 0.85,
        zIndex: 10,
        left: isMobile ? "80%" : "70%",
        height: isMobile ? "16%" : "28%",
        bottom: isMobile ? "32%" : "12%",
      };
    case "back":
      return {
        scale: 1,
        blur: 4,
        opacity: 1,
        zIndex: 5,
        left: "50%",
        height: isMobile ? "13%" : "22%",
        bottom: isMobile ? "32%" : "12%",
      };
  }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function EquipoModal({ equipo, onClose }: { equipo: Equipo; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = equipo.galeria.length > 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-kanot-navy shadow-xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 text-white/80 transition-colors hover:text-kanot-pink"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative aspect-[4/3] w-full bg-kanot-navy-deep">
          <Image
            src={equipo.galeria[index]}
            alt={`Galería de ${equipo.nombre}`}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + equipo.galeria.length) % equipo.galeria.length)}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % equipo.galeria.length)}
                aria-label="Foto siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-kanot-pink-soft">
            {equipo.rango}
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-kanot-pink md:text-3xl">
            {equipo.nombre}
          </h3>
          <p className="mt-3 text-sm text-white/70 md:text-base">
            Galería de fotos próximamente. {equipo.descripcion}
          </p>
        </div>
      </div>
    </div>
  );
}

function CarouselCard({
  equipo,
  role,
  isMobile,
  onSelect,
}: {
  equipo: Equipo;
  role: Role;
  isMobile: boolean;
  onSelect: () => void;
}) {
  const style = getRoleStyle(role, isMobile);
  const isCenter = role === "center";

  return (
    <div
      role={isCenter ? undefined : "button"}
      tabIndex={isCenter ? undefined : 0}
      onClick={isCenter ? undefined : onSelect}
      onKeyDown={
        isCenter
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") onSelect();
            }
      }
      aria-label={isCenter ? undefined : equipo.nombre}
      className="absolute aspect-[3/4]"
      style={{
        left: style.left,
        bottom: style.bottom,
        height: style.height,
        maxHeight: "100%",
        transform: `translateX(-50%) scale(${style.scale})`,
        transformOrigin: "50% 100%",
        filter: `blur(${style.blur}px)`,
        opacity: style.opacity,
        zIndex: style.zIndex,
        willChange: "transform, filter, opacity",
        transition: CARD_TRANSITION_CSS,
        cursor: isCenter ? "default" : "pointer",
      }}
    >
      <Image
        src={equipo.imagen}
        alt={equipo.nombre}
        fill
        sizes="(max-width: 640px) 40vw, 320px"
        className="object-contain drop-shadow-2xl"
      />
    </div>
  );
}

export default function EquiposGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [equipoActivo, setEquipoActivo] = useState<Equipo | null>(null);
  const isMobile = useIsMobile();
  const total = equipos.length;

  function goTo(index: number) {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    setActiveIndex(index);
    window.setTimeout(() => setIsAnimating(false), TRANSITION_MS);
  }

  const goPrev = () => goTo((activeIndex - 1 + total) % total);
  const goNext = () => goTo((activeIndex + 1) % total);
  const equipoCentral = equipos[activeIndex];

  return (
    <div>
      <ScrollReveal className="relative flex items-center justify-center">
        <p className="absolute right-full mr-6 hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.3em] text-white/40 lg:block">
          Temporada
        </p>
        <h2 className="text-center text-4xl font-black uppercase tracking-tight text-kanot-pink sm:text-5xl md:text-6xl">
          Equipos
        </h2>
        <p className="absolute left-full ml-6 hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.3em] text-white/40 lg:block">
          2026 / 2027
        </p>
      </ScrollReveal>

      <div className="relative mx-auto mt-16 max-w-4xl px-2 md:mt-24">
        <div className="relative">
          <div
            className="relative h-[380px] w-full overflow-hidden rounded-[2rem] border border-white/10 sm:h-[480px] md:h-[560px]"
            style={{
              backgroundColor: BACKGROUND_COLORS[activeIndex % BACKGROUND_COLORS.length],
              transition: `background-color ${TRANSITION_MS}ms ${EASE_CSS}`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden px-4">
              <span
                className="select-none whitespace-nowrap text-center font-black uppercase leading-none tracking-tighter text-white/[0.07]"
                style={{ fontSize: "clamp(2rem, 9vw, 5rem)" }}
              >
                KANOT 26/27
              </span>
            </div>

            <div className="absolute inset-0 z-10">
              {equipos.map((equipo, index) => (
                <CarouselCard
                  key={equipo.id}
                  equipo={equipo}
                  role={getRole(index, activeIndex, total)}
                  isMobile={isMobile}
                  onSelect={() => goTo(index)}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Equipo anterior"
            className="absolute left-1 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-kanot-pink hover:text-kanot-pink md:-left-4 md:h-12 md:w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Siguiente equipo"
            className="absolute right-1 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-kanot-pink hover:text-kanot-pink md:-right-4 md:h-12 md:w-12"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div
          key={equipoCentral.id}
          className="mt-6 flex flex-col items-center gap-3 text-center"
        >
          <span className="inline-flex items-center rounded-full bg-kanot-pink px-3 py-1 text-xs font-bold uppercase tracking-wide text-kanot-navy">
            {equipoCentral.categoria}
          </span>
          <p className="text-lg font-black uppercase tracking-tight text-white md:text-xl">
            {equipoCentral.nombre}
          </p>
          <button
            type="button"
            onClick={() => setEquipoActivo(equipoCentral)}
            className="rounded-full border border-kanot-pink/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-kanot-pink transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
          >
            Ver más
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {equipos.map((equipo, index) => (
            <button
              key={equipo.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ir a ${equipo.nombre}`}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-kanot-pink" : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {equipoActivo && (
        <EquipoModal equipo={equipoActivo} onClose={() => setEquipoActivo(null)} />
      )}
    </div>
  );
}
