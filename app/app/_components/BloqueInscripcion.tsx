"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Bell, CheckCircle2, Circle, Euro, Plus, Trash2, Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { GRUPOS, type Entrada } from "./secciones";
import { Aviso, Boton, Etiqueta, Input, Modal } from "./ui";
import { avisarPersonas, fechaAviso, ultimosAvisos } from "./notificaciones";
import { BotonAvisar } from "./BloqueAutorizacion";

type Inscripcion = {
  id: string;
  entrada_id: string;
  bailarin_id: string;
  grupos: string | null;
  categorias: number;
  importe: number;
  extra_opcion: string | null;
  extra_importe: number;
  pareja_con: string | null;
  pagado?: boolean | null;
  bailarines: { nombre: string } | null;
};

const eur = (n: number) => `${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;

function fechaCorta(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

/**
 * Inscripción de un campeonato.
 * Miembro: cuánto cuesta para su(s) bailarín(es) y, si quiere, elegir solo/pareja.
 * Editores/admins: resumen y lista completa, y las opciones de solo/pareja del campeonato.
 * (Los pagos se llevan en el Excel.)
 */
export default function BloqueInscripcion({ entrada, onCambio }: { entrada: Entrada; onCambio?: () => void }) {
  const { esEditor, perfil } = useAuth();
  const [lista, setLista] = useState<Inscripcion[] | null>(null);
  const [verTodas, setVerTodas] = useState(false);

  const cargar = useCallback(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("inscripciones")
      .select("*, bailarines(nombre)")
      .eq("entrada_id", entrada.id);
    let todas = error ? [] : ((data ?? []) as Inscripcion[]);
    // Como miembro, solo los bailarines que un admin ha asignado a ESTA cuenta
    // (aunque quien mire sea un admin usando "Ver como").
    if (!esEditor) {
      const { data: mios } = await supabase.from("cuenta_bailarines").select("bailarin_id").eq("user_id", perfil?.id ?? "");
      const ids = new Set((mios ?? []).map((m) => m.bailarin_id as string));
      todas = todas.filter((i) => ids.has(i.bailarin_id));
    }
    setLista(todas);
  }, [entrada.id, esEditor, perfil?.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    cargar();
  }, [cargar]);

  if (!lista) return null;
  // Sin inscripciones visibles: el miembro no tiene bailarín asignado o el campeonato aún no tiene datos.
  if (!lista.length && !esEditor) return null;

  if (esEditor) {
    const total = lista.reduce((n, i) => n + Number(i.importe) + Number(i.extra_importe), 0);
    const conExtra = lista.filter((i) => i.extra_opcion).length;
    const pagados = lista.filter((i) => i.pagado).length;
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Euro size={16} className="text-kanot-pink" /> Inscripción
        </p>
        <p className="text-sm text-white/70">
          {lista.length ? (
            <>
              {lista.length} bailarines · {eur(total)} en total
              {conExtra ? ` · ${conExtra} con solo/pareja` : ""}
              {" · "}
              {pagados === lista.length ? (
                <span className="font-semibold text-emerald-300">todos pagados</span>
              ) : (
                `${pagados} de ${lista.length} pagados`
              )}
            </>
          ) : (
            "Todavía no hay inscripciones cargadas para este campeonato."
          )}
        </p>
        <button
          type="button"
          onClick={() => setVerTodas(true)}
          className="flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
        >
          <Users size={14} /> Ver inscripciones y opciones
        </button>
        {verTodas && (
          <ListaInscripciones
            entrada={entrada}
            lista={lista}
            onCerrar={() => setVerTodas(false)}
            onCambio={() => {
              cargar();
              onCambio?.();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Euro size={16} className="text-kanot-pink" /> Inscripción
      </p>
      {lista.map((i) => (
        <InscripcionMiembro key={i.id} entrada={entrada} ins={i} onCambio={cargar} />
      ))}
    </div>
  );
}

/** Lo que ve el miembro por cada bailarín suyo. */
function InscripcionMiembro({ entrada, ins, onCambio }: { entrada: Entrada; ins: Inscripcion; onCambio: () => void }) {
  const opciones = entrada.opciones_extra ?? [];
  const cerrado = entrada.limite_extra ? new Date().toISOString().slice(0, 10) > entrada.limite_extra : false;
  const [eligiendo, setEligiendo] = useState<string | null>(null);
  const [con, setCon] = useState(ins.pareja_con ?? "");
  const [error, setError] = useState<string | null>(null);
  const total = Number(ins.importe) + Number(ins.extra_importe);

  async function elegir(opcion: string | null, pareja = "") {
    setError(null);
    const { error } = await getSupabase().rpc("elegir_extra", {
      p_inscripcion: ins.id,
      p_opcion: opcion ?? "",
      p_pareja_con: pareja,
    });
    if (error) setError(error.message);
    else {
      setEligiendo(null);
      onCambio();
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold">{ins.bailarines?.nombre}</p>
        <p className="flex items-center gap-2 text-lg font-black tabular-nums">
          {ins.pagado && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
              <CheckCircle2 size={12} /> Pagado
            </span>
          )}
          {eur(total)}
        </p>
      </div>
      <p className="text-xs text-white/60">
        {ins.grupos} · {ins.categorias} {ins.categorias === 1 ? "categoría" : "categorías"} · {eur(ins.importe)}
        {ins.extra_opcion && (
          <>
            {" "}+ {ins.extra_opcion}
            {ins.pareja_con ? ` con ${ins.pareja_con}` : ""} · {eur(ins.extra_importe)}
          </>
        )}
      </p>

      {opciones.length > 0 && (
        <div className="rounded-xl bg-black/20 p-3">
          {ins.extra_opcion ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>
                Vas a hacer <b>{ins.extra_opcion.toLowerCase()}</b>
                {ins.pareja_con ? ` con ${ins.pareja_con}` : ""}
              </span>
              {!cerrado && (
                <button type="button" onClick={() => elegir(null)} className="text-xs font-semibold text-white/60 hover:text-white">
                  Quitar
                </button>
              )}
            </div>
          ) : cerrado ? (
            <p className="text-xs text-white/50">El plazo para apuntarse a solo o pareja ya ha terminado.</p>
          ) : (
            <>
              <p className="text-sm font-semibold">¿Quieres hacer también solo o pareja?</p>
              <p className="mb-2 text-xs text-white/50">
                Es opcional.{entrada.limite_extra ? ` Puedes elegirlo hasta el ${fechaCorta(entrada.limite_extra)}.` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {opciones.map((o) => (
                  <button
                    key={o.nombre}
                    type="button"
                    onClick={() => (/pareja/i.test(o.nombre) ? setEligiendo(o.nombre) : elegir(o.nombre))}
                    className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold hover:border-kanot-pink hover:text-kanot-pink"
                  >
                    {o.nombre} · +{eur(o.precio)}
                  </button>
                ))}
              </div>
            </>
          )}
          {eligiendo && (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                elegir(eligiendo, con);
              }}
            >
              <Input value={con} onChange={(e) => setCon(e.target.value)} placeholder="¿Con quién?" required className="py-2 text-sm" autoFocus />
              <Boton type="submit" className="shrink-0 px-4">
                Guardar
              </Boton>
            </form>
          )}
          {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
        </div>
      )}
    </div>
  );
}

/** Editores/admins: lista por grupo, totales, quién hace solo/pareja y las opciones del campeonato. */
function ListaInscripciones({
  entrada,
  lista,
  onCerrar,
  onCambio,
}: {
  entrada: Entrada;
  lista: Inscripcion[];
  onCerrar: () => void;
  onCambio: () => void;
}) {
  const [opciones, setOpciones] = useState(entrada.opciones_extra ?? []);
  const [limite, setLimite] = useState(entrada.limite_extra ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grupos = [...GRUPOS.filter((g) => g.nombre !== "Todos juntos").map((g) => g.nombre)];
  const grupoPrincipal = (i: Inscripcion) => grupos.find((g) => i.grupos?.includes(g)) ?? "Otros";
  const ordenadas = [...lista].sort((a, b) => (a.bailarines?.nombre ?? "").localeCompare(b.bailarines?.nombre ?? "", "es"));
  const total = lista.reduce((n, i) => n + Number(i.importe) + Number(i.extra_importe), 0);
  const extras = lista.filter((i) => i.extra_opcion);

  const [pagos, setPagos] = useState<Record<string, boolean>>(() => Object.fromEntries(lista.map((i) => [i.id, Boolean(i.pagado)])));
  const pagados = lista.filter((i) => pagos[i.id]).length;

  const [errorPago, setErrorPago] = useState<string | null>(null);
  // Cuentas de cada bailarín (para avisar) y cuándo se le avisó por última vez.
  const [cuentas, setCuentas] = useState<Record<string, string[]> | null>(null);
  const [avisos, setAvisos] = useState<Record<string, string>>({});
  const [estadoAviso, setEstadoAviso] = useState<Record<string, "enviando" | "ok" | "sin-movil" | "sin-cuenta">>({});
  const [resultadoAviso, setResultadoAviso] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    const ids = lista.map((i) => i.bailarin_id);
    Promise.all([
      supabase.from("cuenta_bailarines").select("user_id, bailarin_id").in("bailarin_id", ids),
      ultimosAvisos(entrada.id, "pago"),
    ]).then(([c, a]) => {
      const mapa: Record<string, string[]> = {};
      for (const f of c.data ?? []) (mapa[f.bailarin_id] ??= []).push(f.user_id);
      setCuentas(mapa);
      setAvisos(a);
    });
  }, [lista, entrada.id]);

  async function avisarPago(inscripciones: Inscripcion[]) {
    setResultadoAviso(null);
    let ok = 0;
    const sinCuenta: string[] = [];
    const sinMovil: string[] = [];
    for (const i of inscripciones) {
      const usuarios = cuentas?.[i.bailarin_id] ?? [];
      const nombre = i.bailarines?.nombre ?? "tu bailarín";
      if (!usuarios.length) {
        sinCuenta.push(nombre);
        setEstadoAviso((e) => ({ ...e, [i.id]: "sin-cuenta" }));
        continue;
      }
      setEstadoAviso((e) => ({ ...e, [i.id]: "enviando" }));
      try {
        const r = await avisarPersonas({
          usuarios,
          titulo: `Pago pendiente · ${entrada.titulo}`,
          cuerpo: `Falta pagar la inscripción de ${nombre}: ${eur(Number(i.importe) + Number(i.extra_importe))}.`,
          url: "/app/kanot-crew?tab=competicion",
          entradaId: entrada.id,
          tipo: "pago",
          bailarinDe: Object.fromEntries(usuarios.map((u) => [u, i.bailarin_id])),
        });
        if (r.avisados.length) ok++;
        else sinMovil.push(nombre);
        setEstadoAviso((e) => ({ ...e, [i.id]: r.avisados.length ? "ok" : "sin-movil" }));
      } catch (err) {
        setEstadoAviso((e) => Object.fromEntries(Object.entries(e).filter(([id]) => id !== i.id)));
        setResultadoAviso(err instanceof Error ? err.message : String(err));
        return;
      }
    }
    setAvisos(await ultimosAvisos(entrada.id, "pago"));
    if (inscripciones.length > 1 || sinCuenta.length || sinMovil.length)
      setResultadoAviso(
        [
          `Avisados: ${ok}.`,
          sinMovil.length ? `Sin notificaciones activadas: ${sinMovil.join(", ")}.` : "",
          sinCuenta.length ? `Sin cuenta asignada: ${sinCuenta.join(", ")}.` : "",
        ]
          .filter(Boolean)
          .join(" "),
      );
  }

  const sinPagar = lista.filter((i) => !pagos[i.id]);

  async function marcarPagado(ids: string[], valor: boolean) {
    setErrorPago(null);
    const antes = pagos;
    setPagos({ ...pagos, ...Object.fromEntries(ids.map((id) => [id, valor])) });
    const { error } = await getSupabase().from("inscripciones").update({ pagado: valor }).in("id", ids);
    if (error) {
      setPagos(antes);
      setErrorPago(/pagado|schema cache/i.test(error.message) ? "Falta activar el SQL 019 para marcar pagos." : error.message);
    } else onCambio();
  }

  async function guardarOpciones() {
    setGuardando(true);
    setError(null);
    const limpias = opciones.filter((o) => o.nombre.trim()).map((o) => ({ nombre: o.nombre.trim(), precio: Number(o.precio) || 0 }));
    const { error } = await getSupabase()
      .from("entradas")
      .update({ opciones_extra: limpias, limite_extra: limite || null })
      .eq("id", entrada.id);
    setGuardando(false);
    if (error) setError(error.message);
    else {
      setGuardado(true);
      onCambio();
    }
  }

  return (
    <Modal titulo={`Inscripciones · ${entrada.titulo}`} onCerrar={onCerrar}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm">
          <span>
            <b className="text-emerald-300">{pagados}</b> de {lista.length} pagados
          </span>
          {pagados < lista.length ? (
            <button
              type="button"
              onClick={() => confirm("¿Marcar a todos como pagados?") && marcarPagado(lista.map((i) => i.id), true)}
              className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30"
            >
              Marcar todos pagados
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-300">Todo pagado</span>
          )}
        </div>
        {errorPago && <Aviso>{errorPago}</Aviso>}
        {sinPagar.length > 0 && (
          <Boton
            variante="secundario"
            onClick={() => confirm(`¿Avisar a los ${sinPagar.length} que no han pagado?`) && avisarPago(sinPagar)}
            disabled={!cuentas}
            className="py-2"
          >
            <Bell size={16} /> Avisar a todos los que no han pagado ({sinPagar.length})
          </Boton>
        )}
        {resultadoAviso && <p className="-mt-2 text-xs text-white/60">{resultadoAviso}</p>}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-2xl font-black">{lista.length}</p>
            <p className="text-[11px] text-white/55">bailarines</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-2xl font-black">{eur(total)}</p>
            <p className="text-[11px] text-white/55">total</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <p className="text-2xl font-black">{extras.length}</p>
            <p className="text-[11px] text-white/55">solo/pareja</p>
          </div>
        </div>

        {/* Opciones de solo/pareja */}
        <section className="flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
          <p className="text-sm font-bold">Solo / pareja en este campeonato</p>
          {opciones.map((o, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={o.nombre}
                onChange={(e) => setOpciones(opciones.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))}
                placeholder="Nombre (p. ej. Pareja)"
                className="py-2 text-sm"
              />
              <Input
                type="number"
                min={0}
                step="0.5"
                value={o.precio}
                onChange={(e) => setOpciones(opciones.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value) } : x)))}
                className="w-24 py-2 text-sm"
                aria-label="Precio en euros"
              />
              <button type="button" onClick={() => setOpciones(opciones.filter((_, j) => j !== i))} aria-label="Quitar" className="p-2 text-white/45 hover:text-white">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOpciones([...opciones, { nombre: "", precio: 0 }])}
            className="flex w-fit items-center gap-1 text-xs font-semibold text-kanot-pink"
          >
            <Plus size={14} /> Añadir opción
          </button>
          <Etiqueta texto="Fecha límite para elegir (opcional)">
            <Input type="date" value={limite} onChange={(e) => setLimite(e.target.value)} className="py-2 text-sm" />
          </Etiqueta>
          {error && <Aviso>{error}</Aviso>}
          {guardado && <Aviso tipo="ok">Guardado.</Aviso>}
          <Boton onClick={guardarOpciones} disabled={guardando} className="py-2">
            {guardando ? "Guardando…" : "Guardar opciones"}
          </Boton>
          <p className="text-[11px] text-white/40">El precio es por bailarín. Marca aquí quién ha pagado (el detalle sigue en el Excel).</p>
        </section>

        {extras.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-kanot-pink">Han elegido solo / pareja</h3>
            <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
              {extras.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 px-3 py-2 text-sm">
                  <span>
                    {i.bailarines?.nombre} · <b>{i.extra_opcion}</b>
                    {i.pareja_con ? ` con ${i.pareja_con}` : ""}
                  </span>
                  <span className="tabular-nums">+{eur(i.extra_importe)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {[...grupos, "Otros"].map((g) => {
          const delGrupo = ordenadas.filter((i) => grupoPrincipal(i) === g);
          if (!delGrupo.length) return null;
          return (
            <section key={g}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">
                {g} · {delGrupo.length}
              </h3>
              <ul className="divide-y divide-white/10 rounded-2xl bg-white/5">
                {delGrupo.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate">{i.bailarines?.nombre}</span>
                      <span className="block text-[11px] text-white/45">
                        {i.grupos} · {i.categorias} cat.{i.extra_opcion ? ` · ${i.extra_opcion}` : ""}
                      </span>
                      {!pagos[i.id] && (estadoAviso[i.id] === "sin-cuenta" || estadoAviso[i.id] === "sin-movil" || avisos[i.bailarin_id]) && (
                        <span className="block text-[11px] text-amber-200/80">
                          {estadoAviso[i.id] === "sin-cuenta"
                            ? "Sin cuenta asignada"
                            : estadoAviso[i.id] === "sin-movil"
                              ? "No tiene las notificaciones activadas"
                              : `Avisado el ${fechaAviso(avisos[i.bailarin_id])}`}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {!pagos[i.id] && cuentas && (
                        <BotonAvisar
                          estado={estadoAviso[i.id] === "ok" ? "ok" : estadoAviso[i.id] === "enviando" ? "enviando" : undefined}
                          onClick={() => avisarPago([i])}
                        />
                      )}
                      <span className="font-semibold tabular-nums">{eur(Number(i.importe) + Number(i.extra_importe))}</span>
                      <button
                        type="button"
                        onClick={() => marcarPagado([i.id], !pagos[i.id])}
                        aria-label={pagos[i.id] ? "Pagado (pulsa para quitar)" : "Marcar como pagado"}
                        title={pagos[i.id] ? "Pagado" : "Sin pagar"}
                        className={pagos[i.id] ? "text-emerald-300" : "text-white/30 hover:text-white/60"}
                      >
                        {pagos[i.id] ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Modal>
  );
}
