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
          correo electrónico <span className="text-white">kanotcrew@gmail.com</span> para
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
            La <strong className="text-white">inscripción a formaciones</strong>: nombre y
            apellidos, DNI/NIE e Instagram (opcional), que se envían por WhatsApp a ByKanot junto con
            la formación elegida.
          </li>
          <li>
            La <strong className="text-white">app ByKanot</strong> (www.bykanot.com/app), descrita en
            el apartado 7.
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
          Tus datos no se ceden a terceros, salvo obligación legal. Para prestar el servicio nos
          apoyamos en proveedores que actúan como encargados del tratamiento:{" "}
          <strong className="text-white">Supabase</strong> (base de datos y archivos de la app,
          alojados en la Unión Europea), <strong className="text-white">Vercel</strong> (alojamiento
          de la web), <strong className="text-white">Resend</strong> (envío de correos) y{" "}
          <strong className="text-white">WhatsApp</strong> (cuando decides escribirnos por ahí).
          Algunos de ellos pueden tratar datos fuera del Espacio Económico Europeo (por ejemplo, en
          EE. UU.), siempre con las garantías que exige el RGPD, como las cláusulas contractuales
          tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU.
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
          correo a <span className="text-white">kanotcrew@gmail.com</span>, indicando el derecho
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
          <span className="text-white">kanotcrew@gmail.com</span>. En el caso de menores de edad,
          este consentimiento debe ser otorgado por su madre, padre o tutor legal.
        </p>
      </>
    ),
  },
  {
    id: "app",
    title: "7. App ByKanot",
    content: (
      <>
        <p>
          La app ByKanot es un espacio privado para la comunidad de ByKanot. Para usarla hay que
          crear una cuenta, que el equipo de ByKanot revisa y activa. En ella tratamos:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong className="text-white">Datos de la cuenta</strong>: nombre, correo electrónico,
            contraseña (guardada cifrada, nadie puede leerla), foto de perfil opcional, rol y, si
            perteneces a Kanot Crew, tu grupo.
          </li>
          <li>
            <strong className="text-white">Autorizaciones de campeonatos</strong>: el documento
            firmado que subes, con los datos del menor (nombre, fecha de nacimiento, DNI/NIE,
            contacto de emergencia e información médica relevante si la indicas) y el nombre del
            bailarín o bailarina y su grupo.
          </li>
          <li>
            <strong className="text-white">Fotos y vídeos</strong> que subas a la galería de Kanot
            Crew.
          </li>
          <li>
            <strong className="text-white">Notificaciones</strong>: si las activas, un identificador
            técnico de tu dispositivo para poder enviarte avisos. Puedes desactivarlas cuando quieras.
          </li>
        </ul>
        <p>
          <strong className="text-white">Finalidad</strong>: organizar los ensayos, competiciones y
          actividades de ByKanot, gestionar la participación de los menores en los campeonatos y
          mantener informada a la comunidad. La base legal es tu consentimiento (y el de la madre,
          padre o tutor legal en el caso de menores) y la gestión de la actividad en la que
          participas.
        </p>
        <p>
          <strong className="text-white">Quién lo ve</strong>: cada persona ve sus propios datos.
          Las autorizaciones, la galería y los datos de la crew solo los ven los miembros autorizados
          de Kanot Crew y el equipo de ByKanot (editores y administradores), según su función.
        </p>
        <p>
          <strong className="text-white">Menores</strong>: los menores de 14 años no pueden crear una
          cuenta por sí mismos; debe hacerlo o autorizarlo su madre, padre o tutor legal.
        </p>
        <p>
          <strong className="text-white">Conservación</strong>: los datos de la cuenta se conservan
          mientras la mantengas activa. Las autorizaciones se conservan durante la temporada en la que
          se usan y se eliminan después. Puedes pedir que borremos tu cuenta y tus datos en cualquier
          momento escribiendo a <span className="text-white">kanotcrew@gmail.com</span>.
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
