"use client";

import { useState } from "react";
import { Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import BotonCalendario from "./BotonCalendario";
import type { Entrada } from "./secciones";
import { Aviso, Boton, Input, Modal } from "./ui";

type Paso = { hora: string; texto: string };

/** Horario del día del campeonato (quedada, actuación, resultados…). Lo rellenan editores y admins. */
export default function ProgramaCompeticion({ entrada, onCambio }: { entrada: Entrada; onCambio?: () => void }) {
  const { esEditor } = useAuth();
  const [editar, setEditar] = useState(false);
  const programa = ((entrada as Entrada & { programa?: Paso[] | null }).programa ?? []).filter((p) => p.texto);

  if (!programa.length && !esEditor) {
    return (
      <div className="flex justify-end">
        <BotonCalendario entrada={entrada} texto="Añadir a mi calendario" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Clock3 size={16} className="text-kanot-pink" /> Horario del día
        </p>
        <BotonCalendario entrada={entrada} texto="Calendario" />
      </div>
      {programa.length > 0 ? (
        <ol className="relative flex flex-col gap-2.5 border-l border-kanot-pink/40 pl-4">
          {programa.map((p, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-kanot-pink" />
              <b className="tabular-nums">{p.hora}</b> <span className="text-white/80">{p.texto}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-white/50">Añade la hora de quedar, de actuar, de los resultados…</p>
      )}
      {esEditor && (
        <button
          type="button"
          onClick={() => setEditar(true)}
          className="flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
        >
          <Pencil size={14} /> {programa.length ? "Cambiar horario" : "Añadir horario"}
        </button>
      )}
      {editar && (
        <EditarPrograma
          entrada={entrada}
          inicial={programa}
          onCerrar={() => setEditar(false)}
          onGuardado={() => {
            setEditar(false);
            onCambio?.();
          }}
        />
      )}
    </div>
  );
}

function EditarPrograma({
  entrada,
  inicial,
  onCerrar,
  onGuardado,
}: {
  entrada: Entrada;
  inicial: Paso[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [pasos, setPasos] = useState<Paso[]>(
    inicial.length ? inicial : [{ hora: "", texto: "Quedada" }, { hora: "", texto: "Actuación" }, { hora: "", texto: "Resultados" }],
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setGuardando(true);
    setError(null);
    const limpios = pasos
      .map((p) => ({ hora: p.hora.trim(), texto: p.texto.trim() }))
      .filter((p) => p.texto)
      .sort((a, b) => a.hora.localeCompare(b.hora));
    const { error } = await getSupabase().from("entradas").update({ programa: limpios }).eq("id", entrada.id);
    setGuardando(false);
    if (error) return setError(/programa|schema cache/i.test(error.message) ? "Falta activar el SQL 024." : error.message);
    onGuardado();
  }

  return (
    <Modal titulo={`Horario · ${entrada.titulo}`} onCerrar={onCerrar}>
      <div className="flex flex-col gap-3">
        {pasos.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Input
              type="time"
              value={p.hora}
              onChange={(e) => setPasos(pasos.map((x, j) => (j === i ? { ...x, hora: e.target.value } : x)))}
              className="w-28 py-2 text-sm"
              aria-label="Hora"
            />
            <Input
              value={p.texto}
              onChange={(e) => setPasos(pasos.map((x, j) => (j === i ? { ...x, texto: e.target.value } : x)))}
              placeholder="Qué pasa"
              className="py-2 text-sm"
            />
            <button type="button" onClick={() => setPasos(pasos.filter((_, j) => j !== i))} aria-label="Quitar" className="p-2 text-white/45 hover:text-white">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPasos([...pasos, { hora: "", texto: "" }])}
          className="flex w-fit items-center gap-1 text-xs font-semibold text-kanot-pink"
        >
          <Plus size={14} /> Añadir línea
        </button>
        {error && <Aviso>{error}</Aviso>}
        <Boton onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar horario"}
        </Boton>
        <p className="text-[11px] text-white/40">Se ordena solo por hora. Las líneas sin texto no se guardan.</p>
      </div>
    </Modal>
  );
}
