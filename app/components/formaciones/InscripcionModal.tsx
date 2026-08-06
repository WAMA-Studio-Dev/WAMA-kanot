"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Formacion } from "@/app/data/formaciones";
import { InputField } from "@/app/components/ui/FormField";
import AgeRangeSlider from "@/app/components/ui/AgeRangeSlider";
import PhoneField from "@/app/components/ui/PhoneField";
import { CARD_TRANSITION, NEON_PINK_RGB, REVEAL_TRANSITION } from "@/app/lib/motion";

const GLOW_SHADOW = `0 0 20px rgba(${NEON_PINK_RGB}, 0.6)`;

const INITIAL_FORM = { nombre: "", telefono: "", email: "", edad: 12 };

type FormState = typeof INITIAL_FORM;
type Status = "idle" | "submitting" | "success";

export default function InscripcionModal({
  formacion,
  onClose,
}: {
  formacion: Formacion;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function handleChange(field: "nombre" | "email") {
    return (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    // Formulario solo de frontend: sin backend todavía.
    // TODO: conectar con un backend o servicio de email (Formspree, Resend...) cuando esté disponible.
    window.setTimeout(() => {
      console.log("Inscripción", formacion.titulo, form);
      setStatus("success");
    }, 700);
  }

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
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-kanot-pink/20 bg-kanot-navy shadow-xl shadow-black/40"
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
                exit={{ opacity: 0 }}
                transition={REVEAL_TRANSITION}
                className="flex flex-col items-center gap-3 py-6 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-kanot-pink/30 bg-kanot-pink/15">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 12.5l5 5L20 7"
                      stroke="var(--color-kanot-pink)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-kanot-pink">
                  ¡Inscripción confirmada!
                </h3>
                <p className="text-sm text-white/80">
                  Te hemos apuntado a {formacion.titulo}. Te contactaremos muy pronto.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 rounded-full border border-kanot-pink/40 px-5 py-2 text-sm font-semibold text-kanot-pink transition-colors hover:bg-kanot-pink hover:text-kanot-navy"
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
                    Apúntate
                  </p>
                  <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-white">
                    {formacion.titulo}
                  </h3>
                </div>

                <InputField
                  label="Nombre y apellidos"
                  name="nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={handleChange("nombre")}
                />
                <PhoneField
                  label="Teléfono de contacto"
                  name="telefono"
                  required
                  onChange={(telefono) => setForm((prev) => ({ ...prev, telefono }))}
                />
                <InputField
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange("email")}
                />
                <AgeRangeSlider
                  label="Edad"
                  name="edad"
                  value={form.edad}
                  onChange={(edad) => setForm((prev) => ({ ...prev, edad }))}
                />

                <motion.button
                  type="submit"
                  disabled={status === "submitting"}
                  whileHover={status === "submitting" ? undefined : { scale: 1.03, boxShadow: GLOW_SHADOW }}
                  whileTap={status === "submitting" ? undefined : { scale: 0.97, boxShadow: GLOW_SHADOW }}
                  transition={CARD_TRANSITION}
                  className="mt-1 rounded-full bg-kanot-pink px-6 py-3 font-bold text-kanot-navy transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? "Enviando..." : "Confirmar inscripción"}
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
