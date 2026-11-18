"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";

export type Pestana = { id: string; nombre: string; icono: LucideIcon };

/** Devuelve la pestaña activa según ?tab= (o la primera). */
export function usePestanaActiva(pestanas: readonly Pestana[]) {
  const params = useSearchParams();
  return pestanas.find((p) => p.id === params.get("tab"))?.id ?? pestanas[0]?.id;
}

/** Distancia mínima (px) del deslizamiento para cambiar de pestaña. */
const UMBRAL = 60;

/** ¿El dedo empezó en algo que ya se desliza solo (carrusel, filtro, mapa) o en una ventana abierta? */
function zonaPropia(objetivo: EventTarget | null) {
  if (!(objetivo instanceof Element)) return false;
  return Boolean(
    objetivo.closest('.overflow-x-auto, [data-sin-deslizar], [role="dialog"], .fixed, input, textarea, select, video, iframe'),
  );
}

/**
 * Barra de pestañas tipo "píldora". En móvil apila icono y texto para que quepan 4.
 * Además, deslizar el dedo a izquierda/derecha en la página cambia de pestaña.
 */
export default function Pestanas({ pestanas, activa }: { pestanas: readonly Pestana[]; activa: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const inicio = useRef<{ x: number; y: number } | null>(null);

  const ir = (id: string) => router.replace(`${pathname}?tab=${id}`, { scroll: false });

  useEffect(() => {
    function alEmpezar(e: TouchEvent) {
      if (e.touches.length !== 1 || zonaPropia(e.target)) {
        inicio.current = null;
        return;
      }
      inicio.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    function alTerminar(e: TouchEvent) {
      const ini = inicio.current;
      inicio.current = null;
      if (!ini) return;
      const dx = e.changedTouches[0].clientX - ini.x;
      const dy = e.changedTouches[0].clientY - ini.y;
      // Solo deslizamientos claramente horizontales (para no molestar al hacer scroll).
      if (Math.abs(dx) < UMBRAL || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const i = pestanas.findIndex((p) => p.id === activa);
      const siguiente = dx < 0 ? i + 1 : i - 1;
      if (siguiente < 0 || siguiente >= pestanas.length) return;
      router.replace(`${pathname}?tab=${pestanas[siguiente].id}`, { scroll: false });
    }
    document.addEventListener("touchstart", alEmpezar, { passive: true });
    document.addEventListener("touchend", alTerminar, { passive: true });
    return () => {
      document.removeEventListener("touchstart", alEmpezar);
      document.removeEventListener("touchend", alTerminar);
    };
  }, [pestanas, activa, pathname, router]);

  return (
    <div role="tablist" className="flex gap-1 rounded-3xl border border-white/10 bg-black/25 p-1 sm:rounded-full">
      {pestanas.map((p) => (
        <button
          key={p.id}
          role="tab"
          type="button"
          aria-selected={activa === p.id}
          onClick={() => ir(p.id)}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors sm:flex-row sm:gap-1.5 sm:rounded-full sm:text-sm ${
            activa === p.id ? "bg-kanot-pink text-kanot-navy-deep" : "text-white/65 hover:text-white"
          }`}
        >
          <p.icono size={16} className="shrink-0" />
          <span className="max-w-full truncate">{p.nombre}</span>
        </button>
      ))}
    </div>
  );
}
