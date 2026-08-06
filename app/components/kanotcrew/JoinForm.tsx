"use client";

import { useState, type FormEvent } from "react";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import { InputField, TextareaField } from "@/app/components/ui/FormField";
import { isValidEmail } from "@/app/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

export default function JoinForm() {
  const [form, setForm] = useState({ nombre: "", email: "", instagram: "", mensaje: "" });
  const [status, setStatus] = useState<Status>("idle");

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          tipo: "Kanot Krew",
          mensaje: form.mensaje,
          extra: { Instagram: form.instagram },
        }),
      });

      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";
  const emailValid = isValidEmail(form.email);
  const canSubmit = form.nombre.trim() !== "" && emailValid && form.mensaje.trim() !== "";

  return (
    <div id="formulario" className="scroll-mt-28 py-16">
      <SectionHeading
        kicker="Kanot Krew"
        title="Formulario"
        description="¿Quieres unirte a la crew? Cuéntanos quién eres."
      />

      <GlassCard className="mt-10 p-6 md:p-10">
        {status === "success" ? (
          <p className="text-lg font-semibold text-kanot-pink">
            ¡Gracias! Hemos recibido tu solicitud, te contactaremos pronto.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Nombre"
              name="nombre"
              type="text"
              required
              value={form.nombre}
              onChange={handleChange("nombre")}
            />
            <div className="flex flex-col gap-1">
              <InputField
                label="Email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange("email")}
              />
              {form.email !== "" && !emailValid && (
                <span className="text-xs font-medium text-red-400">
                  Introduce un email válido (ej: nombre@dominio.com).
                </span>
              )}
            </div>
            <InputField
              label="Instagram"
              name="instagram"
              type="text"
              placeholder="@tuusuario"
              value={form.instagram}
              onChange={handleChange("instagram")}
              className="md:col-span-2"
            />
            <TextareaField
              label="Mensaje"
              name="mensaje"
              required
              value={form.mensaje}
              onChange={handleChange("mensaje")}
              className="md:col-span-2"
            />
            {status === "error" && (
              <p className="md:col-span-2 text-sm font-medium text-red-400">
                No hemos podido enviar tu solicitud. Inténtalo de nuevo en unos minutos.
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="md:col-span-2 rounded-full bg-kanot-pink px-6 py-3 font-bold text-kanot-navy hover:bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
