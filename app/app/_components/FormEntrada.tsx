"use client";

import { useState, type FormEvent } from "react";
import { getSupabase } from "@/app/lib/supabase/client";
import { DIAS, type Campo, type Entrada, type Seccion } from "./secciones";
import { Aviso, Boton, Etiqueta, Input, Modal, Select, Textarea } from "./ui";

type Valores = Record<Campo, string>;

export default function FormEntrada({
  seccion,
  entrada,
  onCerrar,
  onGuardado,
}: {
  seccion: Seccion;
  entrada: Entrada | null;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [valores, setValores] = useState<Valores>({
    titulo: entrada?.titulo ?? "",
    descripcion: entrada?.descripcion ?? "",
    fecha: entrada?.fecha ?? "",
    hora: entrada?.hora ?? "",
    dia_semana: entrada?.dia_semana ? String(entrada.dia_semana) : "",
    lugar: entrada?.lugar ?? "",
    enlace: entrada?.enlace ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (c: Campo) => (e: { target: { value: string } }) => setValores((v) => ({ ...v, [c]: e.target.value }));

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const vacio = (s: string) => (s.trim() === "" ? null : s.trim());
    let enlace = vacio(valores.enlace);
    if (enlace && !/^https?:\/\//i.test(enlace)) enlace = `https://${enlace}`;

    const fila = {
      seccion: seccion.slug,
      titulo: valores.titulo.trim(),
      descripcion: vacio(valores.descripcion),
      fecha: vacio(valores.fecha),
      hora: vacio(valores.hora),
      dia_semana: valores.dia_semana ? Number(valores.dia_semana) : null,
      lugar: vacio(valores.lugar),
      enlace,
    };

    const supabase = getSupabase();
    const { error } = entrada
      ? await supabase.from("entradas").update(fila).eq("id", entrada.id)
      : await supabase.from("entradas").insert(fila);

    setGuardando(false);
    if (error) setError(error.message);
    else onGuardado();
  }

  const c = seccion.campos;

  return (
    <Modal titulo={`${entrada ? "Editar" : "Añadir"} · ${seccion.nombre}`} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        {c.titulo && (
          <Etiqueta texto={c.titulo}>
            <Input
              value={valores.titulo}
              onChange={set("titulo")}
              required
              autoFocus
              list={seccion.sugerencias ? `sugerencias-${seccion.slug}` : undefined}
            />
            {seccion.sugerencias && (
              <datalist id={`sugerencias-${seccion.slug}`}>
                {seccion.sugerencias.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            )}
          </Etiqueta>
        )}
        {c.dia_semana && (
          <Etiqueta texto={c.dia_semana}>
            <Select value={valores.dia_semana} onChange={set("dia_semana")} required>
              <option value="">Elige un día</option>
              {DIAS.map((d, i) => (
                <option key={d} value={i + 1}>
                  {d}
                </option>
              ))}
            </Select>
          </Etiqueta>
        )}
        {c.fecha && (
          <Etiqueta texto={c.fecha}>
            <Input type="date" value={valores.fecha} onChange={set("fecha")} required={seccion.vista === "calendario"} />
          </Etiqueta>
        )}
        {c.hora && (
          <Etiqueta texto={c.hora}>
            <Input value={valores.hora} onChange={set("hora")} placeholder="18:00 – 19:30" />
          </Etiqueta>
        )}
        {c.lugar && (
          <Etiqueta texto={c.lugar}>
            <Input value={valores.lugar} onChange={set("lugar")} />
          </Etiqueta>
        )}
        {c.descripcion && (
          <Etiqueta texto={c.descripcion}>
            <Textarea value={valores.descripcion} onChange={set("descripcion")} />
          </Etiqueta>
        )}
        {c.enlace && (
          <Etiqueta texto={c.enlace}>
            <Input type="text" inputMode="url" value={valores.enlace} onChange={set("enlace")} placeholder="https://…" />
          </Etiqueta>
        )}

        {error && <Aviso>{error}</Aviso>}

        <div className="mt-2 flex justify-end gap-3">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
