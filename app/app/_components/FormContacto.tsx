"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { isValidEmail } from "@/app/lib/validation";
import { useAuth } from "./AuthProvider";
import { Aviso, Boton, Etiqueta, Input, Textarea } from "./ui";

/**
 * Formulario de contacto de la app. Usa el mismo envío que la web (/api/contact):
 * llega al correo de Kanot con el "tipo" indicado y la persona recibe una confirmación.
 */
export default function FormContacto({
  tipo,
  placeholder = "Cuéntanos qué necesitas…",
  textoBoton = "Enviar mensaje",
}: {
  tipo: string;
  placeholder?: string;
  textoBoton?: string;
}) {
  const { perfil } = useAuth();
  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [email, setEmail] = useState(perfil?.email ?? "");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState<"listo" | "enviando" | "enviado">("listo");
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) return setError("Revisa el email.");
    setEstado("enviando");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          telefono,
          tipo,
          mensaje,
          extra: { Origen: "App ByKanot" },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se ha podido enviar. Inténtalo de nuevo en unos minutos.");
      }
      setEstado("enviado");
    } catch (err) {
      setEstado("listo");
      setError(err instanceof Error ? err.message : "No se ha podido enviar.");
    }
  }

  if (estado === "enviado") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
        <CheckCircle2 className="text-emerald-300" size={32} />
        <p className="font-bold">¡Mensaje enviado!</p>
        <p className="text-sm text-white/70">Te responderemos lo antes posible a {email}.</p>
        <Boton
          variante="secundario"
          onClick={() => {
            setMensaje("");
            setEstado("listo");
          }}
        >
          Enviar otro
        </Boton>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/25 p-5">
      <Etiqueta texto="Nombre">
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoComplete="name" />
      </Etiqueta>
      <Etiqueta texto="Email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          inputMode="email"
        />
      </Etiqueta>
      <Etiqueta texto="Teléfono (opcional)">
        <Input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" inputMode="tel" />
      </Etiqueta>
      <Etiqueta texto="Mensaje">
        <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} required placeholder={placeholder} rows={5} />
      </Etiqueta>
      {error && <Aviso>{error}</Aviso>}
      <Boton type="submit" disabled={estado === "enviando"} className="py-3">
        <Send size={16} /> {estado === "enviando" ? "Enviando…" : textoBoton}
      </Boton>
    </form>
  );
}
