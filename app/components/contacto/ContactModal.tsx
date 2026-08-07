"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { InputField, SelectField, TextareaField } from "@/app/components/ui/FormField";
import AgeRangeSlider from "@/app/components/ui/AgeRangeSlider";
import PhoneField from "@/app/components/ui/PhoneField";
import { CARD_TRANSITION, NEON_PINK_RGB, REVEAL_TRANSITION } from "@/app/lib/motion";
import { isValidEmail, isValidPhone } from "@/app/lib/validation";

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
  edad: 18,
  municipio: "",
  objetivo: "",
  rangoCompeticion: "",
  formacion: "",
  detalles: "",
};

type FormState = typeof INITIAL_FORM;
type Status = "idle" | "submitting" | "success" | "error";

export default function ContactModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleChange(field: keyof FormState) {
    return (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleObjetivoChange(e: ChangeEvent<HTMLSelectElement>) {
    const objetivo = e.target.value;
    setForm((prev) => ({ ...prev, objetivo, rangoCompeticion: "", formacion: "" }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const objetivoLabel = OBJETIVOS.find((o) => o.value === form.objetivo)?.label ?? "Contacto";

    const extra: Record<string, string> = {
      Instagram: form.instagram,
      Municipio: form.municipio,
    };
    if (form.rangoCompeticion) extra["Rango de competición"] = form.rangoCompeticion;
    if (form.formacion) extra["Formación de interés"] = form.formacion;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          tipo: objetivoLabel,
          edad: form.edad,
          instagram: form.instagram,
          mensaje: form.detalles,
          extra,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          res.status === 429
            ? data?.error ?? "Demasiadas solicitudes. Espera un minuto antes de volver a intentarlo."
            : data?.error ?? "No hemos podido enviar tu solicitud. Inténtalo de nuevo en unos minutos."
        );
      }
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : "No hemos podido enviar tu solicitud. Inténtalo de nuevo en unos minutos."
      );
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";
  const emailValid = isValidEmail(form.email);
  const phoneValid = isValidPhone(form.telefono);
  const objetivoValid =
    form.objetivo !== "" &&
    (form.objetivo !== "grupo-competicion" || form.rangoCompeticion !== "") &&
    (form.objetivo !== "formaciones" || form.formacion !== "");
  const canSubmit =
    form.nombre.trim() !== "" &&
    emailValid &&
    phoneValid &&
    form.municipio.trim() !== "" &&
    objetivoValid;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={REVEAL_TRANSITION}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-kanot-pink/20 bg-kanot-navy shadow-xl shadow-black/40"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 text-white/70 transition-colors hover:text-kanot-pink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-6 md:p-8">
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
                  onClick={onClose}
                  className="mt-2 rounded-full border border-kanot-pink/40 px-6 py-2.5 text-sm font-semibold text-kanot-pink transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
                >
                  Cerrar
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kanot-pink-soft">
                    Contacto
                  </p>
                  <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-white md:text-2xl">
                    ¿Quieres formar parte de ByKanot?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InputField
                    label="Nombre y apellidos"
                    name="nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={handleChange("nombre")}
                    className="md:col-span-2"
                  />

                  <div className="flex flex-col gap-1">
                    <InputField
                      label="Correo electrónico"
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

                  <PhoneField
                    label="Teléfono de contacto"
                    name="telefono"
                    required
                    onChange={(value) => setForm((prev) => ({ ...prev, telefono: value }))}
                    error={form.telefono !== "" && !phoneValid ? "Teléfono no válido." : undefined}
                  />

                  <InputField
                    label="Instagram (opcional)"
                    name="instagram"
                    type="text"
                    placeholder="@usuario"
                    value={form.instagram}
                    onChange={handleChange("instagram")}
                  />

                  <InputField
                    label="Municipio donde resides"
                    name="municipio"
                    type="text"
                    required
                    value={form.municipio}
                    onChange={handleChange("municipio")}
                  />

                  <AgeRangeSlider
                    label="Edad"
                    name="edad"
                    value={form.edad}
                    onChange={(edad) => setForm((prev) => ({ ...prev, edad }))}
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
                    maxLength={1000}
                    className="md:col-span-2"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm font-medium text-red-400">{errorMessage}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  whileHover={isSubmitting || !canSubmit ? undefined : { scale: 1.03, boxShadow: GLOW_SHADOW }}
                  whileTap={isSubmitting || !canSubmit ? undefined : { scale: 0.97, boxShadow: GLOW_SHADOW }}
                  transition={CARD_TRANSITION}
                  className="mt-2 rounded-full bg-kanot-pink px-8 py-3.5 font-bold text-kanot-navy transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
