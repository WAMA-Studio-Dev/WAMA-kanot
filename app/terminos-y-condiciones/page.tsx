import type { Metadata } from "next";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Términos y Condiciones | ByKanot",
  description:
    "Términos y condiciones de uso de los servicios, formaciones e inscripciones de ByKanot.",
};

export default function TerminosYCondicionesPage() {
  return (
    <LegalPageLayout title="Términos y Condiciones">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">1. Objeto</h2>
        <p>
          Estos términos y condiciones regulan el uso del sitio web de ByKanot y la relación entre
          ByKanot y los usuarios que se inscriban en formaciones, grupos de competición u otras
          actividades ofrecidas a través del Sitio o de nuestros canales de contacto.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">2. Inscripciones y formaciones</h2>
        <p>
          Las solicitudes de inscripción a formaciones o al grupo de competición realizadas a
          través del formulario de contacto no implican una plaza confirmada hasta que ByKanot
          contacte con el usuario para validar disponibilidad y confirmar los detalles de la
          actividad (fechas, horarios, precio y condiciones específicas).
        </p>
        <p>
          Las condiciones económicas, plazos y política de cancelación de cada formación se
          comunicarán de forma individual en el momento de la confirmación de la plaza.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">3. Obligaciones del usuario</h2>
        <p>
          El usuario se compromete a facilitar datos veraces y actualizados en los formularios del
          Sitio, a hacer un uso adecuado de las instalaciones y materiales durante las formaciones
          y eventos, y a respetar las normas de convivencia y disciplina propias de la actividad de
          danza urbana.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">4. Imagen y contenido audiovisual</h2>
        <p>
          Durante formaciones, ensayos y eventos de ByKanot pueden realizarse fotografías y vídeos
          con fines promocionales y de difusión en redes sociales. La participación en estas
          actividades implica la aceptación de este uso, salvo que el usuario (o su tutor legal, en
          caso de menores) manifieste expresamente lo contrario por escrito.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">5. Modificaciones</h2>
        <p>
          ByKanot podrá modificar estos términos y condiciones en cualquier momento para adaptarlos
          a novedades legislativas u organizativas. La versión vigente será siempre la publicada en
          esta página, junto con la fecha de última actualización.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">6. Contacto</h2>
        <p>
          Para cualquier duda relacionada con estos términos y condiciones, puedes escribirnos a{" "}
          <span className="text-white">contacto@bykanot.com</span>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
