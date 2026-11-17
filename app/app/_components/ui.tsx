"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { X } from "lucide-react";

export function Boton({
  variante = "primario",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" | "peligro" }) {
  const estilos = {
    primario: "bg-kanot-pink text-kanot-navy-deep hover:bg-kanot-pink-soft",
    secundario: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
    peligro: "border border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20",
  }[variante];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${estilos} ${className}`}
    />
  );
}

const campoBase =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/35 outline-none transition focus:border-kanot-pink focus:bg-white/10";

export function Etiqueta({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-white/80">
      {texto}
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${campoBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`${campoBase} resize-y ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${campoBase} [&>option]:text-black ${props.className ?? ""}`} />;
}

export function Tarjeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-black/25 p-5 shadow-lg shadow-black/20 backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

export function Modal({
  titulo,
  onCerrar,
  children,
}: {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-kanot-navy-deep p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Aviso({ tipo = "error", children }: { tipo?: "error" | "ok"; children: ReactNode }) {
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm ${
        tipo === "error" ? "bg-red-500/15 text-red-200" : "bg-emerald-500/15 text-emerald-200"
      }`}
    >
      {children}
    </p>
  );
}

export function Cargando() {
  return (
    <div className="flex justify-center py-16">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-kanot-pink" />
    </div>
  );
}
