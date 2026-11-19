"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import type { LineaCesta } from "@/app/components/merch/ProductoCard";
import { whatsappUrl } from "@/app/data/merch";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { Aviso, Boton, Modal } from "./ui";

const CLAVE = "kanot-cesta";

/** Cesta del merch. Se recuerda en este móvil hasta que se envía el pedido. */
export function useCesta() {
  const [lineas, setLineas] = useState<LineaCesta[]>([]);

  useEffect(() => {
    try {
      const guardada = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- recuperar la cesta guardada en el móvil
      if (Array.isArray(guardada)) setLineas(guardada);
    } catch {
      /* sin cesta guardada */
    }
  }, []);

  function guardar(nuevas: LineaCesta[]) {
    setLineas(nuevas);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevas));
    } catch {
      /* sin almacenamiento: la cesta vive solo en esta pantalla */
    }
  }

  return {
    lineas,
    anadir: (l: LineaCesta) => guardar([...lineas, l]),
    quitar: (id: string) => guardar(lineas.filter((l) => l.id !== id)),
    vaciar: () => guardar([]),
  };
}

const eur = (n: number) => `${n.toLocaleString("es-ES", { maximumFractionDigits: 2 })} €`;

/** Barra flotante con lo que hay en la cesta. */
export function BarraCesta({ lineas, onAbrir }: { lineas: LineaCesta[]; onAbrir: () => void }) {
  if (!lineas.length) return null;
  const total = lineas.reduce((n, l) => n + l.precio, 0);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
      <button
        type="button"
        onClick={onAbrir}
        className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-full bg-kanot-pink px-5 py-3 text-kanot-navy-deep shadow-xl shadow-black/40"
      >
        <ShoppingBag size={20} />
        <span className="flex-1 text-left text-sm font-bold">
          Cesta · {lineas.length} {lineas.length === 1 ? "prenda" : "prendas"}
        </span>
        <span className="text-base font-black tabular-nums">{eur(total)}</span>
        <span className="rounded-full bg-kanot-navy-deep/15 px-3 py-1 text-xs font-bold">Ver</span>
      </button>
    </div>
  );
}

/** Cesta abierta: quitar prendas y enviar el pedido (se guarda en la app y se abre WhatsApp). */
export function ModalCesta({
  lineas,
  onQuitar,
  onEnviado,
  onCerrar,
}: {
  lineas: LineaCesta[];
  onQuitar: (id: string) => void;
  onEnviado: () => void;
  onCerrar: () => void;
}) {
  const { perfil } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = lineas.reduce((n, l) => n + l.precio, 0);

  async function enviar() {
    if (!lineas.length) return;
    setEnviando(true);
    setError(null);
    const texto = [
      "¡Hola! Quiero reservar este merch de ByKanot:",
      ...lineas.map((l) => `• ${l.producto}, ${l.detalle} · ${eur(l.precio)}`),
      `Total: ${eur(total)}`,
      perfil?.nombre ? `A nombre de: ${perfil.nombre}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    // Se abre la ventana antes de guardar para que el móvil no la bloquee.
    const ventana = window.open("", "_blank");
    const { error } = await getSupabase()
      .from("pedidos_merch")
      .insert({
        nombre: perfil?.nombre ?? perfil?.email ?? null,
        items: lineas.map(({ producto, detalle, precio }) => ({ producto, detalle, precio })),
        total,
      });
    setEnviando(false);
    if (error) {
      // Aunque no se guarde en la app, el pedido sigue llegando por WhatsApp.
      console.error("No se pudo guardar el pedido:", error.message);
    }
    const url = whatsappUrl(texto);
    if (ventana) ventana.location.href = url;
    else window.location.assign(url);
    onEnviado();
  }

  return (
    <Modal titulo="Tu cesta" onCerrar={onCerrar}>
      <div className="flex flex-col gap-4">
        {lineas.length ? (
          <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
            {lineas.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{l.producto}</span>
                  <span className="block text-xs text-white/55">{l.detalle}</span>
                </span>
                <span className="font-bold tabular-nums">{eur(l.precio)}</span>
                <button type="button" onClick={() => onQuitar(l.id)} aria-label="Quitar" className="p-1 text-white/45 hover:text-white">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/60">La cesta está vacía.</p>
        )}
        <div className="flex items-baseline justify-between px-1">
          <span className="text-sm text-white/60">Total</span>
          <span className="text-2xl font-black tabular-nums">{eur(total)}</span>
        </div>
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={enviar} disabled={enviando || !lineas.length}>
          <WhatsAppIcon className="h-4 w-4" /> {enviando ? "Un momento…" : "Enviar pedido por WhatsApp"}
        </Boton>
        <p className="text-center text-xs text-white/45">Se abre WhatsApp con todo el pedido escrito. Allí te confirmamos el pago y la entrega.</p>
      </div>
    </Modal>
  );
}
