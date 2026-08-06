import type { Metadata } from "next";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Aviso Legal | ByKanot",
  description: "Aviso legal y condiciones generales de uso del sitio web de ByKanot.",
};

export default function AvisoLegalPage() {
  return (
    <LegalPageLayout title="Aviso Legal">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">1. Datos identificativos</h2>
        <p>
          En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002,
          de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico
          (LSSI-CE), se informa a los usuarios del sitio web{" "}
          <strong className="text-white">bykanot.com</strong> (en adelante, &ldquo;el
          Sitio&rdquo;) de los siguientes datos:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Titular: ByKanot</li>
          <li>Actividad: proyecto de danza urbana, formación y competición</li>
          <li>Domicilio: Sevilla, España</li>
          <li>Correo electrónico de contacto: contacto@bykanot.com</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">2. Objeto</h2>
        <p>
          El presente Aviso Legal regula el uso del Sitio, que ByKanot pone a disposición de los
          usuarios con el fin de ofrecer información sobre sus grupos de competición, formaciones,
          Kodigo Klub, podcast y demás actividades relacionadas con la danza urbana.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">3. Condiciones de acceso y uso</h2>
        <p>
          El acceso al Sitio es gratuito y no requiere suscripción o registro previo, salvo para la
          cumplimentación de los formularios de contacto e inscripción a formaciones. El usuario se
          compromete a hacer un uso adecuado y lícito del Sitio, así como de los contenidos y
          servicios que se ofrecen, de conformidad con la legislación vigente, la buena fe y el
          orden público.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">4. Propiedad intelectual e industrial</h2>
        <p>
          Todos los contenidos del Sitio (textos, imágenes, vídeos, logotipos, diseño gráfico y
          código fuente), salvo que se indique lo contrario, son titularidad de ByKanot o de
          terceros que han autorizado su uso, y están protegidos por la normativa de propiedad
          intelectual e industrial. Queda prohibida su reproducción, distribución o transformación
          sin autorización expresa y por escrito.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">5. Exclusión de responsabilidad</h2>
        <p>
          ByKanot no se hace responsable de las interrupciones, errores o fallos que se produzcan
          en el acceso al Sitio por causas ajenas a su control, ni del uso indebido que los
          usuarios pudieran hacer de los contenidos publicados.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">6. Legislación aplicable</h2>
        <p>
          Las presentes condiciones se rigen por la legislación española. Para cualquier
          controversia derivada del uso del Sitio, las partes se someten a los Juzgados y
          Tribunales que correspondan conforme a derecho.
        </p>
      </section>
    </LegalPageLayout>
  );
}
