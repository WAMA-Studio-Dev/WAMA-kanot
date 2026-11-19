"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Search, UserPlus, UsersRound, X } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { Boton, Input } from "./ui";

type Vinculo = { bailarin_id: string; bailarines: { nombre: string; grupos: string[] } | null };
type Solicitud = { id: string; hijo_nombre: string; bailarin_id: string | null; estado: "pendiente" | "aprobada" | "rechazada" };
type Bailarin = { id: string; nombre: string; grupos: string[] };

const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/**
 * Perfil: bailarines vinculados a la cuenta y, para madres/padres, solicitar vincular a su hijo/a
 * (un admin lo aprueba en Usuarios).
 */
export default function MiFamilia() {
  const { perfil } = useAuth();
  const [vinculos, setVinculos] = useState<Vinculo[] | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [pidiendo, setPidiendo] = useState(false);
  const [lista, setLista] = useState<Bailarin[] | null>(null);
  const [busca, setBusca] = useState("");
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!perfil) return;
    const supabase = getSupabase();
    const [v, s] = await Promise.all([
      supabase.from("cuenta_bailarines").select("bailarin_id, bailarines(nombre, grupos)").eq("user_id", perfil.id),
      supabase
        .from("solicitudes_familia")
        .select("id, hijo_nombre, bailarin_id, estado")
        .eq("user_id", perfil.id)
        .order("created_at", { ascending: false }),
    ]);
    setVinculos(v.error ? [] : ((v.data ?? []) as unknown as Vinculo[]));
    setSolicitudes(s.error ? [] : ((s.data ?? []) as Solicitud[]));
  }, [perfil]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  if (!perfil || !vinculos) return null;

  const bailarines = vinculos.map((v) => v.bailarines).filter((b): b is NonNullable<typeof b> => Boolean(b));
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const rechazadas = solicitudes.filter((s) => s.estado === "rechazada").slice(0, 1);
  const esFamilia = perfil.tipo === "familia";

  async function abrir() {
    setPidiendo(true);
    setError(null);
    if (lista) return;
    const { data, error } = await getSupabase().from("bailarines").select("id, nombre, grupos").order("nombre");
    if (error) setError(error.message);
    setLista((data ?? []) as Bailarin[]);
  }

  async function solicitar(b: Bailarin) {
    setEnviando(b.id);
    setError(null);
    const { error } = await getSupabase().from("solicitudes_familia").insert({ hijo_nombre: b.nombre, bailarin_id: b.id });
    setEnviando(null);
    if (error) {
      setError(/bailarin_id|schema cache/i.test(error.message) ? "Falta activar el SQL 016." : error.message);
      return;
    }
    setBusca("");
    setPidiendo(false);
    cargar();
  }

  // En la lista no salen los que ya son suyos ni los que ya ha pedido.
  const yaTiene = new Set([
    ...vinculos.map((v) => v.bailarin_id),
    ...pendientes.map((s) => s.bailarin_id).filter(Boolean),
  ]);
  const opciones = (lista ?? [])
    .filter((b) => !yaTiene.has(b.id))
    .filter((b) => !busca.trim() || normalizar(b.nombre).includes(normalizar(busca.trim())));

  async function cancelar(id: string) {
    await getSupabase().from("solicitudes_familia").delete().eq("id", id);
    cargar();
  }

  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">
        {esFamilia ? "Tus bailarines" : "Tu bailarín"}
      </h2>
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/25 p-4">
        {bailarines.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {bailarines.map((b) => (
              <li key={b.nombre} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kanot-pink/15 text-kanot-pink">
                  <UsersRound size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{b.nombre}</span>
                  <span className="block text-xs text-white/55">{b.grupos.join(" + ")}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          !esFamilia && (
            <p className="text-sm text-white/60">Tu cuenta todavía no está vinculada a ningún bailarín. El equipo lo hará pronto.</p>
          )
        )}

        {pendientes.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl bg-amber-300/10 px-3 py-2 text-sm">
            <Clock size={16} className="shrink-0 text-amber-200" />
            <span className="flex-1">
              Pendiente de aprobar: <b>{s.hijo_nombre}</b>
            </span>
            <button type="button" onClick={() => cancelar(s.id)} aria-label="Cancelar solicitud" className="p-1 text-white/50 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}
        {rechazadas.map((s) => (
          <p key={s.id} className="text-xs text-white/50">
            El equipo no ha podido vincular a {s.hijo_nombre}. Si es un error, escríbenos.
          </p>
        ))}

        {pidiendo ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Elige a tu hijo/a</p>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nombre" className="pl-9" autoFocus />
            </div>
            {!lista && <p className="text-sm text-white/50">Cargando…</p>}
            {lista && (
              <ul className="max-h-72 divide-y divide-white/5 overflow-y-auto rounded-2xl bg-white/5">
                {opciones.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => solicitar(b)}
                      disabled={enviando !== null}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-white/5 disabled:opacity-50"
                    >
                      <span>{enviando === b.id ? "Enviando…" : b.nombre}</span>
                      <span className="shrink-0 text-xs text-white/45">{b.grupos.join(" + ")}</span>
                    </button>
                  </li>
                ))}
                {!opciones.length && <li className="px-3 py-4 text-sm text-white/50">No hay nadie con ese nombre.</li>}
              </ul>
            )}
            {error && <p className="text-xs text-red-200">{error}</p>}
            <Boton type="button" variante="secundario" onClick={() => setPidiendo(false)}>
              Cancelar
            </Boton>
            <p className="text-[11px] text-white/40">Un admin de Kanot lo comprobará y vinculará a tu hijo/a con tu cuenta.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={abrir}
            className="flex items-center gap-2 self-start rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-kanot-pink hover:text-kanot-pink"
          >
            <UserPlus size={16} /> {esFamilia ? "Añadir otro hijo/a" : "¿Eres madre, padre o tutor/a?"}
          </button>
        )}
      </div>
    </section>
  );
}
