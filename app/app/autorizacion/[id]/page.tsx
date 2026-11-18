"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import type { Entrada } from "../../_components/secciones";
import { Aviso, Cargando } from "../../_components/ui";
import DocumentoAutorizacion from "../../_components/DocumentoAutorizacion";

/**
 * Autorización de ByKanot para un campeonato, lista para imprimir o guardar como PDF.
 * Se rellena sola con los datos del campeonato (fecha, lugar, salida y regreso).
 */
export default function PaginaAutorizacion() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [entrada, setEntrada] = useState<Entrada | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabase()
      .from("entradas")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setError("No se ha encontrado el campeonato.");
        else setEntrada(data as Entrada);
      });
  }, [id]);

  if (error) return <Aviso>{error}</Aviso>;
  if (!entrada) return <Cargando />;

  return (
    <div className="flex flex-col gap-4">
      {/* Botones (no salen al imprimir) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-white/70 hover:text-kanot-pink"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-kanot-pink px-5 py-2.5 text-sm font-bold text-kanot-navy-deep"
        >
          <Printer size={16} /> Imprimir o guardar PDF
        </button>
      </div>
      <p className="text-xs text-white/50 print:hidden">
        En el móvil: pulsa “Imprimir o guardar PDF” y elige <b>Guardar como PDF</b> (Android) o comparte el PDF (iPhone).
        Fírmala y súbela desde el campeonato en la app.
      </p>

      <DocumentoAutorizacion entrada={entrada} />
    </div>
  );
}
