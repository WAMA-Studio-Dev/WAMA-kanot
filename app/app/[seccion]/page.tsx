import { notFound } from "next/navigation";
import { SECCIONES, getSeccion } from "../_components/secciones";
import VistaSeccion from "../_components/VistaSeccion";

// Apartados que se ven dentro de otra página (Kodigo Klub y Kanot Kamp tienen la suya propia con pestañas).
const CON_PAGINA_PROPIA = [
  "kodigo-klub",
  "kanot-kamp",
  "kanot-kamp-info",
  "kanot-kamp-profes",
  "podcast",
  "agencia",
  "fotografia",
];

export function generateStaticParams() {
  return SECCIONES.filter((s) => !CON_PAGINA_PROPIA.includes(s.slug)).map((s) => ({ seccion: s.slug }));
}

export const dynamicParams = false;

export default async function PaginaSeccion({ params }: PageProps<"/app/[seccion]">) {
  const { seccion } = await params;
  if (!getSeccion(seccion)) notFound();
  return <VistaSeccion slug={seccion} />;
}
