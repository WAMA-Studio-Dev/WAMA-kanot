"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { REVEAL_TRANSITION } from "@/app/lib/motion";
import {
  useCookieConsent,
  type CookiePreferences,
} from "@/app/components/legal/CookieConsentContext";

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-kanot-pink" : "bg-white/15"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-full" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PreferencesModal({
  initial,
  onClose,
  onSave,
}: {
  initial: CookiePreferences;
  onClose: () => void;
  onSave: (preferences: CookiePreferences) => void;
}) {
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [marketing, setMarketing] = useState(initial.marketing);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
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
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-kanot-pink/20 bg-kanot-navy shadow-xl shadow-black/40"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 text-white/70 transition-colors hover:text-kanot-pink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kanot-pink-soft">
            Privacidad
          </p>
          <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-white md:text-2xl">
            Preferencias de cookies
          </h3>
          <p className="mt-3 text-sm text-white/70">
            Elige qué tipo de cookies permites en bykanot.com. Puedes cambiar esta configuración
            cuando quieras desde el enlace &ldquo;Configurar cookies&rdquo; en el pie de página.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div>
                <p className="font-semibold text-white">Técnicas</p>
                <p className="mt-1 text-sm text-white/60">
                  Necesarias para que la web funcione correctamente. Siempre activas.
                </p>
              </div>
              <Toggle checked disabled label="Cookies técnicas (siempre activas)" />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div>
                <p className="font-semibold text-white">Analíticas</p>
                <p className="mt-1 text-sm text-white/60">
                  Nos ayudan a entender cómo se usa la web para mejorarla.
                </p>
              </div>
              <Toggle
                checked={analytics}
                onChange={setAnalytics}
                label="Cookies analíticas"
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div>
                <p className="font-semibold text-white">Marketing</p>
                <p className="mt-1 text-sm text-white/60">
                  Utilizadas para mostrar contenido y anuncios más relevantes.
                </p>
              </div>
              <Toggle
                checked={marketing}
                onChange={setMarketing}
                label="Cookies de marketing"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSave({ necessary: true, analytics, marketing })}
              className="rounded-full bg-kanot-pink px-6 py-2.5 text-sm font-bold text-kanot-navy transition-colors hover:bg-white"
            >
              Guardar preferencias
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function CookieBanner() {
  const {
    preferences,
    showBanner,
    showPreferences,
    openPreferences,
    closePreferences,
    acceptAll,
    rejectNonEssential,
    savePreferences,
  } = useCookieConsent();

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={REVEAL_TRANSITION}
            className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-slate-950/90 p-4 backdrop-blur-md md:p-5"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-kanot-pink" />
                <p className="text-sm text-white/80">
                  Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el
                  tráfico y mostrar contenido personalizado. Puedes aceptarlas, rechazarlas o
                  configurarlas. Consulta nuestra{" "}
                  <Link
                    href="/politica-de-cookies"
                    className="text-kanot-pink underline underline-offset-2 hover:text-white"
                  >
                    Política de Cookies
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={openPreferences}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
                >
                  Configurar cookies
                </button>
                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/5"
                >
                  Rechazar no esenciales
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-full bg-kanot-pink px-5 py-2.5 text-sm font-bold text-kanot-navy transition-colors hover:bg-white"
                >
                  Aceptar todas
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreferences && (
          <PreferencesModal
            initial={preferences}
            onClose={closePreferences}
            onSave={savePreferences}
          />
        )}
      </AnimatePresence>
    </>
  );
}
