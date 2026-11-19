"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { comprimirImagen } from "./comprimirImagen";
import { Aviso, Boton, Etiqueta, Input, Modal } from "./ui";

const eur = (n: number) => `${Number(n).toLocaleString("es-ES", { maximumFractionDigits: 2 })} €`;

type Pedido = {
  id: string;
  nombre: string | null;
  items: { producto: string; detalle: string; precio: number }[];
  total: number;
  created_at: string;
};

/** Editores/admins: pedidos de merch hechos desde la app. */
export function PedidosMerch({ onCerrar }: { onCerrar: () => void }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await getSupabase().from("pedidos_merch").select("*").order("created_at", { ascending: false });
    if (error) setError(/pedidos_merch|schema cache/i.test(error.message) ? "Falta activar el SQL 023." : error.message);
    setPedidos((data ?? []) as Pedido[]);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  async function borrar(p: Pedido) {
    if (!confirm(`¿Borrar el pedido de ${p.nombre ?? "esta persona"}?`)) return;
    await getSupabase().from("pedidos_merch").delete().eq("id", p.id);
    cargar();
  }

  // Cuántas de cada prenda y talla (para saber qué encargar).
  const resumen = new Map<string, number>();
  for (const p of pedidos ?? []) for (const i of p.items) resumen.set(`${i.producto} · ${i.detalle}`, (resumen.get(`${i.producto} · ${i.detalle}`) ?? 0) + 1);
  const total = (pedidos ?? []).reduce((n, p) => n + Number(p.total), 0);

  return (
    <Modal titulo="Pedidos de merch" onCerrar={onCerrar}>
      {!pedidos ? (
        <p className="text-sm text-white/60">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-5">
          {error && <Aviso>{error}</Aviso>}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-2xl font-black">{pedidos.length}</p>
              <p className="text-[11px] text-white/55">pedidos</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="text-2xl font-black">{eur(total)}</p>
              <p className="text-[11px] text-white/55">en total</p>
            </div>
          </div>

          {resumen.size > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-kanot-pink">Resumen por talla</h3>
              <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
                {[...resumen.entries()]
                  .sort((a, b) => a[0].localeCompare(b[0], "es"))
                  .map(([k, n]) => (
                    <li key={k} className="flex justify-between gap-3 px-3 py-2 text-sm">
                      <span>{k}</span>
                      <b className="tabular-nums">× {n}</b>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">Todos los pedidos</h3>
            {!pedidos.length && <p className="text-sm text-white/55">Todavía no hay pedidos desde la app.</p>}
            <ul className="flex flex-col gap-2">
              {pedidos.map((p) => (
                <li key={p.id} className="rounded-2xl bg-white/5 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span>
                      <b>{p.nombre ?? "Sin nombre"}</b>
                      <span className="block text-xs text-white/45">
                        {new Date(p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <b className="tabular-nums">{eur(p.total)}</b>
                      <button type="button" onClick={() => borrar(p)} aria-label="Borrar pedido" className="p-1 text-white/45 hover:text-white">
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                  <ul className="mt-1.5 text-xs text-white/70">
                    {p.items.map((i, n) => (
                      <li key={n}>
                        • {i.producto}, {i.detalle}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </Modal>
  );
}

export type Precios = { camiseta: number; pantalon: number; pack: number };

/** Precios guardados en la app (si no hay, se usan los de siempre). */
export function usePreciosMerch(porDefecto: Precios) {
  const [precios, setPrecios] = useState<Precios>(porDefecto);
  const cargar = useCallback(async () => {
    const { data } = await getSupabase().from("merch_precios").select("producto, precio");
    if (data?.length) {
      setPrecios((p) => ({ ...p, ...Object.fromEntries(data.map((d) => [d.producto, Number(d.precio)])) }));
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);
  return { precios, recargar: cargar };
}

export function EditarPrecios({ precios, onCerrar, onGuardado }: { precios: Precios; onCerrar: () => void; onGuardado: () => void }) {
  const [valores, setValores] = useState(precios);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setGuardando(true);
    setError(null);
    const { error } = await getSupabase()
      .from("merch_precios")
      .upsert(Object.entries(valores).map(([producto, precio]) => ({ producto, precio, updated_at: new Date().toISOString() })));
    setGuardando(false);
    if (error) return setError(/merch_precios|schema cache/i.test(error.message) ? "Falta activar el SQL 023." : error.message);
    onGuardado();
  }

  return (
    <Modal titulo="Cambiar precios" onCerrar={onCerrar}>
      <div className="flex flex-col gap-4">
        {(
          [
            ["camiseta", "Camiseta"],
            ["pantalon", "Pantalón"],
            ["pack", "Pack (camiseta + pantalón)"],
          ] as const
        ).map(([k, nombre]) => (
          <Etiqueta key={k} texto={`${nombre} (€)`}>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={valores[k]}
              onChange={(e) => setValores({ ...valores, [k]: Number(e.target.value) })}
            />
          </Etiqueta>
        ))}
        <p className="text-xs text-white/50">
          El “ahorras” del pack se calcula solo: camiseta + pantalón − pack ({eur(valores.camiseta + valores.pantalon - valores.pack)}).
        </p>
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar precios"}
        </Boton>
      </div>
    </Modal>
  );
}

export type FotoMerch = { src: string; alt: string; ruta?: string };

/** Fotos del merch subidas desde la app (si no hay ninguna, se usan las de siempre). */
export function useFotosMerch(porDefecto: FotoMerch[]) {
  const [subidas, setSubidas] = useState<FotoMerch[] | null>(null);
  const cargar = useCallback(async () => {
    const almacen = getSupabase().storage.from("merch");
    const { data, error } = await almacen.list("", { limit: 100, sortBy: { column: "name", order: "asc" } });
    if (error) return setSubidas([]);
    setSubidas(
      (data ?? [])
        .filter((f) => f.id && f.name !== ".emptyFolderPlaceholder")
        .map((f) => ({ src: almacen.getPublicUrl(f.name).data.publicUrl, alt: "Merch ByKanot", ruta: f.name })),
    );
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);
  return { fotos: subidas?.length ? subidas : porDefecto, propias: Boolean(subidas?.length), recargar: cargar };
}

/** Editores/admins: añadir y quitar fotos del merch. */
export function EditarFotos({ fotos, propias, onCerrar, onCambio }: { fotos: FotoMerch[]; propias: boolean; onCerrar: () => void; onCambio: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir(archivos: FileList) {
    setError(null);
    const almacen = getSupabase().storage.from("merch");
    const lista = Array.from(archivos);
    for (const [i, original] of lista.entries()) {
      setSubiendo(`Subiendo ${i + 1} de ${lista.length}…`);
      const f = await comprimirImagen(original, { maxLado: 1800, calidad: 0.86 });
      const { error } = await almacen.upload(`${Date.now()}-${i}.jpg`, f, { contentType: f.type });
      if (error) setError(/bucket not found|row-level/i.test(error.message) ? "Falta activar el SQL 023." : error.message);
    }
    setSubiendo(null);
    onCambio();
  }

  async function quitar(f: FotoMerch) {
    if (!f.ruta || !confirm("¿Quitar esta foto?")) return;
    await getSupabase().storage.from("merch").remove([f.ruta]);
    onCambio();
  }

  return (
    <Modal titulo="Fotos del merch" onCerrar={onCerrar}>
      <div className="flex flex-col gap-4">
        {!propias && (
          <p className="rounded-2xl bg-white/5 p-3 text-xs text-white/60">
            Ahora se ven las fotos de siempre. En cuanto subas la primera, se verán solo las que subas aquí.
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((f) => (
            <div key={f.src} className="relative aspect-[4/5] overflow-hidden rounded-xl bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura */}
              <img src={f.src} alt={f.alt} className="h-full w-full object-cover" />
              {f.ruta && (
                <button
                  type="button"
                  onClick={() => quitar(f)}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-500/80"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {subiendo && <Aviso tipo="ok">{subiendo}</Aviso>}
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={() => input.current?.click()} disabled={!!subiendo}>
          <ImagePlus size={17} /> Añadir fotos
        </Boton>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) subir(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-[11px] text-white/40">Salen en el orden en que las subes.</p>
      </div>
    </Modal>
  );
}
