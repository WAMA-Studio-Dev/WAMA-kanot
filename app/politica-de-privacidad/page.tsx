"use client";

import { useState } from "react";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";
import Accordion, { type AccordionItem } from "@/app/components/legal/Accordion";

const ITEMS: AccordionItem[] = [
  {
    id: "responsable",
    title: "1. Responsable del tratamiento",
    content: (
      <>
        <p>
          El responsable del tratamiento de tus datos personales es{" "}
          <strong className="text-white">ByKanot</strong>, proyecto de danza urbana, formación y
          competición con domicilio en Sevilla, España. Puedes contactar con nosotros a través del
          correo electrónico <span className="text-white">contacto@bykanot.com</span> para
          cualquier cuestión relacionada con la protección de tus datos.
        </p>
      </>
    ),
  },
  {
    id: "datos-recogidos",
    title: "2. Datos recogidos",
    content: (
      <>
        <p>Recogemos datos personales exclusivamente a través de:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            El <strong className="text-white">formulario de contacto</strong>: nombre y apellidos,
            correo electrónico, teléfono, Instagram (opcional), municipio, edad, objetivo de
            contacto y detalles adicionales.
          </li>
          <li>
            El <strong className="text-white">formulario de inscripción a formaciones</strong>:
            los datos anteriores junto con la formación o rango de competición seleccionado.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "finalidad",
    title: "3. Finalidad y legitimación del tratamiento",
    content: (
      <>
        <p>
          Tratamos tus datos para gestionar tu solicitud de contacto o inscripción, informarte
          sobre formaciones, grupos de competición y actividades de ByKanot, y responder a tus
          consultas.
        </p>
        <p>
          La base legal para este tratamiento es el{" "}
          <strong className="text-white">consentimiento del interesado</strong>, otorgado al
          cumplimentar y enviar voluntariamente los formularios del Sitio.
        </p>
      </>
    ),
  },
  {
    id: "conservacion",
    title: "4. Conservación de datos y destinatarios",
    content: (
      <>
        <p>
          Tus datos se conservarán durante el tiempo necesario para atender tu solicitud y, en su
          caso, mientras dure la relación derivada de tu inscripción en una formación o grupo de
          competición, salvo que solicites su supresión con anterioridad.
        </p>
        <p>
          Tus datos no se ceden a terceros, salvo obligación legal, y no se realizan
          transferencias internacionales de datos.
        </p>
      </>
    ),
  },
  {
    id: "derechos",
    title: "5. Derechos del usuario",
    content: (
      <>
        <p>
          Puedes ejercer en cualquier momento tus derechos de{" "}
          <strong className="text-white">
            acceso, rectificación, cancelación/supresión y oposición
          </strong>{" "}
          (así como portabilidad y limitación del tratamiento, cuando corresponda) enviando un
          correo a <span className="text-white">contacto@bykanot.com</span>, indicando el derecho
          que deseas ejercer y adjuntando un documento que acredite tu identidad.
        </p>
        <p>
          Si consideras que tus datos no se tratan correctamente, también puedes presentar una
          reclamación ante la Agencia Española de Protección de Datos (AEPD).
        </p>
      </>
    ),
  },
  {
    id: "imagen",
    title: "6. Consentimiento y tratamiento de imagen / contenido audiovisual",
    content: (
      <>
        <p>
          Durante formaciones, ensayos y eventos de ByKanot pueden captarse fotografías y vídeos en
          los que aparezcan participantes, con el fin de difundirlos en el Sitio y en redes
          sociales de ByKanot (Instagram, TikTok) como parte de nuestra actividad de formación y
          competición.
        </p>
        <p>
          La participación en estas actividades implica el consentimiento para este uso de tu
          imagen, salvo que manifiestes expresamente lo contrario por escrito a{" "}
          <span className="text-white">contacto@bykanot.com</span>. En el caso de menores de edad,
          este consentimiento debe ser otorgado por su madre, padre o tutor legal.
        </p>
      </>
    ),
  },
];

const ALL_IDS = ITEMS.map((item) => item.id);

export default function PoliticaDePrivacidadPage() {
  const [expanded, setExpanded] = useState<string[]>([]);

  function toggleItem(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((current) => current !== id) : [...prev, id]
    );
  }

  return (
    <LegalPageLayout title="Política de Privacidad">
      <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-wide">
        <button
          type="button"
          onClick={() => setExpanded(ALL_IDS)}
          className="text-kanot-pink transition-colors hover:text-white"
        >
          Expandir todo
        </button>
        <span className="text-white/20">|</span>
        <button
          type="button"
          onClick={() => setExpanded([])}
          className="text-kanot-pink transition-colors hover:text-white"
        >
          Colapsar todo
        </button>
      </div>

      <Accordion items={ITEMS} expanded={expanded} onToggle={toggleItem} />
    </LegalPageLayout>
  );
}
