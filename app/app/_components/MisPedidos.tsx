"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ShoppingBag, Trophy } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";

const eur = (n: number) => `${Number(n).toLocaleString("es-ES", { maximumFractionDigits: 2 })} €`;

type Pedido = { id: string; items: { producto: string; detalle: string }[]; total: number; created_at: string };
type Inscripcion = {
  id: string;
  importe: number;
  extra_importe: number;
  extra_opcion: string | null;
  pagado?: boolean | null;
  bailarines: { nombre: string } | null;
  entradas: { titulo: string; fecha: string | null } | null;
};

/** Perfil: mis pedidos de merch y las inscripciones de mis bailarines, en un mismo sitio. */
export default function MisPedidos() {
  const { perfil } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);

  useEffect(() => {
    if (!perfil) return;
    const supabase = getSupabase();
    Promise.all([
      supabase.from("pedidos_merch").select("id, items, total, created_at").eq("user_id", perfil.id).order("created_at", { ascending: false }),
      supabase.from("cuenta_bailarines").select("bailarin_id").eq("user_id", perfil.id),
    ]).then(async ([p, c]) => {
      setPedidos((p.data ?? []) as Pedido[]);
      const ids = (c.data ?? []).map((x) => x.bailarin_id as string);
      if (!ids.length) return;
      const { data } = await supabase
        .from("inscripciones")
        .select("id, importe, extra_importe, extra_opcion, pagado, bailarines(nombre), entradas(titulo, fecha)")
        .in("bailarin_id", ids);
      const lista = ((data ?? []) as unknown as Inscripcion[]).sort((a, b) => (b.entradas?.fecha ?? "").localeCompare(a.entradas?.fecha ?? ""));
      setInscripciones(lista);
    });
  }, [perfil]);

  if (!pedidos || (!pedidos.length && !inscripciones.length)) return null;

  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">Mis pedidos</h2>
      <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
        {inscripciones.map((i) => (
          <li key={i.id}>
            <Link href="/app/kanot-crew?tab=competicion" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
              <Trophy size={18} className="shrink-0 text-kanot-pink" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{i.entradas?.titulo ?? "Campeonato"}</span>
                <span className="block truncate text-xs text-white/50">
                  Inscripción · {i.bailarines?.nombre}
                  {i.extra_opcion ? ` · ${i.extra_opcion}` : ""}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <b className="text-sm tabular-nums">{eur(Number(i.importe) + Number(i.extra_importe))}</b>
                {i.pagado ? (
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-300">
                    <CheckCircle2 size={11} /> Pagado
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-200/80">Pendiente</span>
                )}
              </span>
            </Link>
          </li>
        ))}
        {pedidos.map((p) => (
          <li key={p.id}>
            <Link href="/app/merch" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5">
              <ShoppingBag size={18} className="shrink-0 text-kanot-pink" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">Merch · {p.items.length} {p.items.length === 1 ? "prenda" : "prendas"}</span>
                <span className="block truncate text-xs text-white/50">
                  {new Date(p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} ·{" "}
                  {p.items.map((x) => x.producto).join(", ")}
                </span>
              </span>
              <b className="shrink-0 text-sm tabular-nums">{eur(p.total)}</b>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
