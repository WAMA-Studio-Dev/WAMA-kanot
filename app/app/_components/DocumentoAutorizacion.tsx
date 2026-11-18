"use client";

import Image from "next/image";
import type { Entrada } from "./secciones";

function fechaLarga(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Documento de autorización de ByKanot para un campeonato (se imprime o guarda como PDF). */
export default function DocumentoAutorizacion({ entrada }: { entrada: Entrada }) {
  const temporada = entrada.fecha && Number(entrada.fecha.slice(5, 7)) >= 9
    ? `${entrada.fecha.slice(2, 4)}/${Number(entrada.fecha.slice(2, 4)) + 1}`
    : entrada.fecha
      ? `${Number(entrada.fecha.slice(2, 4)) - 1}/${entrada.fecha.slice(2, 4)}`
      : "";

  return (
    <>
      <article className="mx-auto w-full max-w-[720px] rounded-lg bg-white p-7 text-[13px] leading-relaxed text-neutral-900 shadow-2xl print:max-w-none print:rounded-none print:p-0 print:shadow-none sm:p-10">
        <header className="flex items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              ByKanot · Kanot Crew {temporada && `· Temporada ${temporada}`}
            </p>
            <h1 className="mt-1 text-xl font-black uppercase leading-tight">Autorización para menores</h1>
            <p className="text-base font-bold">{entrada.titulo}</p>
          </div>
          <Image src="/imagenes/logo/bykanot-icon.png" alt="ByKanot" width={64} height={64} className="h-14 w-14" />
        </header>

        <section className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 rounded bg-neutral-100 p-3">
          <Dato etiqueta="Fecha" valor={entrada.fecha ? fechaLarga(entrada.fecha) : "Por confirmar"} />
          <Dato etiqueta="Lugar" valor={entrada.lugar ?? "Por confirmar"} />
          <Dato etiqueta="Horario / desplazamiento" valor={entrada.hora ?? "Por confirmar"} />
          <Dato etiqueta="Salida" valor="Bormujos (Sevilla)" />
        </section>

        <section className="mt-5 flex flex-col gap-3">
          <p>
            D./D.ª <Linea ancho="w-64" />, con DNI/NIE <Linea ancho="w-32" />, como padre, madre o tutor/a legal
            del/de la menor:
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Campo etiqueta="Nombre y apellidos del/de la menor" ancho />
            <Campo etiqueta="Fecha de nacimiento" />
            <Campo etiqueta="DNI/NIE del/de la menor" />
            <Campo etiqueta="Grupo (Kanot Jr, Knallas, Knelo, Kinkis)" />
            <Campo etiqueta="Teléfono de contacto" />
            <Campo etiqueta="Teléfono de emergencia (otra persona)" />
            <Campo etiqueta="Alergias, medicación o información médica relevante" ancho />
          </div>
        </section>

        <section className="mt-5">
          <p className="font-bold uppercase">Autorizo a que el/la menor:</p>
          <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5">
            <li>
              Participe con <b>ByKanot / Kanot Crew</b> en el campeonato <b>{entrada.titulo}</b>
              {entrada.lugar ? ` (${entrada.lugar})` : ""}
              {entrada.fecha ? `, el ${fechaLarga(entrada.fecha)}` : ""}.
            </li>
            <li>
              Se desplace con el grupo en el transporte organizado por ByKanot, con salida y regreso en Bormujos, bajo la
              supervisión del equipo responsable.
            </li>
            <li>
              Sea atendido/a y, si fuera necesario, trasladado/a a un centro sanitario en caso de urgencia, avisando de
              inmediato a la familia.
            </li>
            <li>Cumpla las normas del campeonato y del grupo durante toda la jornada.</li>
          </ol>
        </section>

        <section className="mt-5">
          <p className="font-bold uppercase">Derechos de imagen</p>
          <p className="mt-1">
            ByKanot y la organización del campeonato pueden tomar fotos y vídeos durante la jornada para sus redes sociales,
            web y material promocional.
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            <Casilla>SÍ autorizo el uso de la imagen del/de la menor.</Casilla>
            <Casilla>NO autorizo el uso de la imagen del/de la menor.</Casilla>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-8">
          <Campo etiqueta="Lugar y fecha" />
          <div>
            <div className="h-14 border-b border-neutral-900" />
            <p className="mt-1 text-[11px] text-neutral-500">Firma del padre, madre o tutor/a legal</p>
          </div>
        </section>

        <footer className="mt-8 border-t border-neutral-300 pt-3 text-[10px] leading-snug text-neutral-500">
          Documento interno de ByKanot. Si la organización del campeonato exige su propia autorización, también habrá
          que entregarla. Los datos se usan solo para gestionar la participación en este evento.
        </footer>
      </article>
    </>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <p>
      <span className="text-[11px] font-semibold uppercase text-neutral-500">{etiqueta}: </span>
      <span className="font-semibold first-letter:uppercase">{valor}</span>
    </p>
  );
}

function Linea({ ancho }: { ancho: string }) {
  return <span className={`inline-block ${ancho} border-b border-neutral-900 align-bottom`}>&nbsp;</span>;
}

function Campo({ etiqueta, ancho }: { etiqueta: string; ancho?: boolean }) {
  return (
    <div className={ancho ? "col-span-2" : ""}>
      <div className="h-6 border-b border-neutral-900" />
      <p className="mt-0.5 text-[11px] text-neutral-500">{etiqueta}</p>
    </div>
  );
}

function Casilla({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2">
      <span className="inline-block h-4 w-4 shrink-0 border border-neutral-900" /> {children}
    </p>
  );
}
