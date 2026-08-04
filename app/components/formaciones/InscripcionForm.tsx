"use client";

import { useState, type FormEvent } from "react";
import type { Formacion } from "@/app/data/formaciones";
import GlassCard from "@/app/components/ui/GlassCard";
import { InputField, TextareaField, SelectField } from "@/app/components/ui/FormField";

export default function InscripcionForm({ formaciones }: { formaciones: Formacion[] }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    formacionId: formaciones[0]?.id ?? "",
    mensaje: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Formulario solo de frontend: sin backend todavía.
    // TODO: conectar con un backend o servicio de email (Formspree, Resend...) cuando esté disponible.
    console.log("Inscripción Formaciones:", form);
    setSubmitted(true);
  }

  return (
    <GlassCard className="p-6 md:p-10">
      {submitted ? (
        <p className="text-lg font-semibold text-kanot-pink">
          ¡Gracias! Hemos recibido tu inscripción, te contactaremos pronto.
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
            label="Teléfono"
            name="telefono"
            type="tel"
            required
            value={form.telefono}
            onChange={handleChange("telefono")}
          />
          <SelectField
            label="Formación de interés"
            name="formacionId"
            required
            value={form.formacionId}
            onChange={handleChange("formacionId")}
          >
            {formaciones.map((f) => (
              <option key={f.id} value={f.id}>
                {f.titulo}
              </option>
            ))}
          </SelectField>
          <TextareaField
            label="Mensaje"
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange("mensaje")}
            className="md:col-span-2"
          />
          <button
            type="submit"
            className="md:col-span-2 rounded-full bg-kanot-pink px-6 py-3 font-bold text-kanot-navy hover:bg-white transition-colors"
          >
            Enviar inscripción
          </button>
        </form>
      )}
    </GlassCard>
  );
}
