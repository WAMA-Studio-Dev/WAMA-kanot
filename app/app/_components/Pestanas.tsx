"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export type Pestana = { id: string; nombre: string; icono: LucideIcon };

/** Devuelve la pestaña activa según ?tab= (o la primera). */
export function usePestanaActiva(pestanas: readonly Pestana[]) {
  const params = useSearchParams();
  return pestanas.find((p) => p.id === params.get("tab"))?.id ?? pestanas[0]?.id;
}

/** Barra de pestañas tipo "píldora". En móvil apila icono y texto para que quepan 4. */
export default function Pestanas({ pestanas, activa }: { pestanas: readonly Pestana[]; activa: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div role="tablist" className="flex gap-1 rounded-3xl border border-white/10 bg-black/25 p-1 sm:rounded-full">
      {pestanas.map((p) => (
        <button
          key={p.id}
          role="tab"
          type="button"
          aria-selected={activa === p.id}
          onClick={() => router.replace(`${pathname}?tab=${p.id}`, { scroll: false })}
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
