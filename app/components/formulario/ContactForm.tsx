"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "@/app/components/ui/GlassCard";
import { InputField, SelectField, TextareaField } from "@/app/components/ui/FormField";
import { CARD_TRANSITION, NEON_PINK_RGB, REVEAL_TRANSITION } from "@/app/lib/motion";

const EDAD_OPTIONS = Array.from({ length: 87 }, (_, i) => i + 4);

const RANGOS_COMPETICION = ["Hasta 12 años", "12 - 14 años", "14 - 17 años"];

const FORMACIONES_DISPONIBLES = ["Formación Octubre", "Formación Diciembre", "Formación Enero"];

const OBJETIVOS = [
  { value: "grupo-competicion", label: "Grupo de competición" },
  { value: "podcast", label: "Podcast" },
  { value: "kodigo-klub", label: "Kodigo Klub" },
  { value: "formaciones", label: "Formaciones" },
  { value: "fotografia", label: "Fotografía / Material audiovisual" },
  { value: "otros", label: "Otros" },
];

const GLOW_SHADOW = `0 0 20px rgba(${NEON_PINK_RGB}, 0.6)`;

const INITIAL_FORM = {
  nombre: "",
  email: "",
  telefono: "",
  instagram: "",
  edad: "",
  municipio: "",
  objetivo: "",
  rangoCompeticion: "",
  formacion: "",
  detalles: "",
};

type FormState = typeof INITIAL_FORM;
type Status = "idle" | "submitting" | "success";

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<Status>("idle");

  function handleChange(field: keyof FormState) {
    return (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleObjetivoChange(e: ChangeEvent<HTMLSelectElement>) {
    const objetivo = e.target.value;
    setForm((prev) => ({ ...prev, objetivo, rangoCompeticion: "", formacion: "" }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    // Formulario solo de frontend: sin backend todavía.
    // TODO: conectar con un backend o servicio de email (Formspree, Resend...) cuando esté disponible.
    window.setTimeout(() => {
      console.log("Solicitud Formulario ByKanot:", form);
      setStatus("success");
    }, 900);
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setStatus("idle");
  }

  const isSubmitting = status === "submitting";

  return (
    <GlassCard className="p-6 md:p-10">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={REVEAL_TRANSITION}
            className="flex flex-col items-center gap-4 py-10 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-kanot-pink/30 bg-kanot-pink/15">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5l5 5L20 7"
                  stroke="var(--color-kanot-pink)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-kanot-pink">
              ¡Solicitud enviada!
            </h3>
            <p className="max-w-md text-white/80">
              Hemos recibido tu solicitud correctamente. Nuestro equipo se pondrá en contacto
              contigo muy pronto.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-2 rounded-full border border-kanot-pink/40 px-6 py-2.5 text-sm font-semibold text-kanot-pink transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
            >
              Enviar otra solicitud
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={REVEAL_TRANSITION}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <InputField
              label="Nombre y apellidos"
              name="nombre"
              type="text"
              required
              value={form.nombre}
              onChange={handleChange("nombre")}
              className="md:col-span-2"
            />

            <InputField
              label="Correo electrónico"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
            />

            <InputField
              label="Teléfono de contacto"
              name="telefono"
              type="tel"
              required
              pattern="^[+]?[0-9\s]{9,15}$"
              title="Introduce un número de teléfono válido"
              value={form.telefono}
              onChange={handleChange("telefono")}
            />

            <InputField
              label="Instagram (opcional)"
              name="instagram"
              type="text"
              placeholder="@usuario"
              value={form.instagram}
              onChange={handleChange("instagram")}
            />

            <SelectField
              label="Edad"
              name="edad"
              required
              value={form.edad}
              onChange={handleChange("edad")}
            >
              <option value="" disabled>
                Selecciona tu edad
              </option>
              {EDAD_OPTIONS.map((edad) => (
                <option key={edad} value={edad}>
                  {edad} años
                </option>
              ))}
            </SelectField>

            <InputField
              label="Municipio donde resides"
              name="municipio"
              type="text"
              required
              value={form.municipio}
              onChange={handleChange("municipio")}
              className="md:col-span-2"
            />

            <SelectField
              label="Objetivo de contacto"
              name="objetivo"
              required
              value={form.objetivo}
              onChange={handleObjetivoChange}
              className="md:col-span-2"
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              {OBJETIVOS.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </SelectField>

            {form.objetivo === "grupo-competicion" && (
              <SelectField
                label="Rango de edad del grupo de competición"
                name="rangoCompeticion"
                required
                value={form.rangoCompeticion}
                onChange={handleChange("rangoCompeticion")}
                className="md:col-span-2"
              >
                <option value="" disabled>
                  Selecciona un rango de edad
                </option>
                {RANGOS_COMPETICION.map((rango) => (
                  <option key={rango} value={rango}>
                    {rango}
                  </option>
                ))}
              </SelectField>
            )}

            {form.objetivo === "formaciones" && (
              <SelectField
                label="Formación de interés"
                name="formacion"
                required
                value={form.formacion}
                onChange={handleChange("formacion")}
                className="md:col-span-2"
              >
                <option value="" disabled>
                  Selecciona una formación
                </option>
                {FORMACIONES_DISPONIBLES.map((formacion) => (
                  <option key={formacion} value={formacion}>
                    {formacion}
                  </option>
                ))}
              </SelectField>
            )}

            <TextareaField
              label="Detalles extra (opcional)"
              name="detalles"
              value={form.detalles}
              onChange={handleChange("detalles")}
              className="md:col-span-2"
            />

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={isSubmitting ? undefined : { scale: 1.03, boxShadow: GLOW_SHADOW }}
              whileTap={isSubmitting ? undefined : { scale: 0.97, boxShadow: GLOW_SHADOW }}
              transition={CARD_TRANSITION}
              className="mt-2 rounded-full bg-kanot-pink px-8 py-3.5 font-bold text-kanot-navy transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            >
              {isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
