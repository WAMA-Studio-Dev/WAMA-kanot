import type { Metadata } from "next";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Política de Cookies | ByKanot",
  description: "Información sobre el uso de cookies propias y de terceros en bykanot.com.",
};

export default function PoliticaDeCookiesPage() {
  return (
    <LegalPageLayout title="Política de Cookies">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en el navegador
          del usuario para recordar información sobre su visita, como preferencias de
          configuración o datos de navegación. bykanot.com utiliza cookies propias y de terceros
          para garantizar el correcto funcionamiento del Sitio, analizar su uso y, en su caso,
          mostrar contenido personalizado.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">2. Tipos de cookies utilizadas</h2>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="text-white">Cookies técnicas (necesarias):</strong> imprescindibles
            para el funcionamiento básico del Sitio, como recordar tu elección sobre el uso de
            cookies. No requieren consentimiento y no pueden desactivarse.
          </li>
          <li>
            <strong className="text-white">Cookies analíticas:</strong> nos permiten conocer cómo
            interactúan los usuarios con el Sitio (páginas visitadas, tiempo de navegación) para
            mejorar la experiencia. Solo se activan con tu consentimiento.
          </li>
          <li>
            <strong className="text-white">Cookies de marketing:</strong> utilizadas para mostrar
            contenido y comunicaciones más relevantes en función de tus intereses. Solo se activan
            con tu consentimiento.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">3. Gestión de tus preferencias</h2>
        <p>
          Puedes aceptar todas las cookies, rechazar las no esenciales o configurar tus
          preferencias en cualquier momento desde el enlace &ldquo;Configurar cookies&rdquo;
          disponible en el pie de página del Sitio. Tu elección se guarda en el navegador y podrás
          modificarla siempre que lo desees.
        </p>
        <p>
          Adicionalmente, puedes eliminar o bloquear las cookies desde la configuración de tu
          propio navegador. Ten en cuenta que deshabilitar determinadas cookies puede afectar al
          funcionamiento del Sitio.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white">4. Actualizaciones de esta política</h2>
        <p>
          Esta Política de Cookies puede actualizarse para adaptarse a cambios legislativos o en el
          funcionamiento del Sitio. Te recomendamos revisarla periódicamente.
        </p>
      </section>
    </LegalPageLayout>
  );
}
