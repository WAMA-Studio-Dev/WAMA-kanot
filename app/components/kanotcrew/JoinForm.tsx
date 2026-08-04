"use client";

import { useState, type FormEvent } from "react";
import SectionHeading from "@/app/components/ui/SectionHeading";
import GlassCard from "@/app/components/ui/GlassCard";
import { InputField, TextareaField } from "@/app/components/ui/FormField";

export default function JoinForm() {
  const [form, setForm] = useState({ nombre: "", email: "", instagram: "", mensaje: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Formulario solo de frontend: sin backend todavía.
    // TODO: conectar con un backend o servicio de email (Formspree, Resend...) cuando esté disponible.
    console.log("Solicitud Kanot Krew:", form);
    setSubmitted(true);
  }

  return (
    <div id="formulario" className="scroll-mt-28 py-16">
      <SectionHeading
        kicker="Kanot Krew"
        title="Formulario"
        description="¿Quieres unirte a la crew? Cuéntanos quién eres."
      />

      <GlassCard className="mt-10 p-6 md:p-10">
        {submitted ? (
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
            <InputField
              label="Email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
            />
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
            <button
              type="submit"
              className="md:col-span-2 rounded-full bg-kanot-pink px-6 py-3 font-bold text-kanot-navy hover:bg-white transition-colors"
            >
              Enviar solicitud
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
