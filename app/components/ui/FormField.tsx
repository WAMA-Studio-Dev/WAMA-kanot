import type { SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClasses =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/40 focus:border-kanot-pink focus:outline-none focus:ring-1 focus:ring-kanot-pink transition-colors";

type BaseProps = {
  label: string;
  name: string;
  className?: string;
};

export function InputField({
  label,
  name,
  className = "",
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-white/80 ${className}`}>
      {label}
      <input id={name} name={name} className={fieldClasses} {...rest} />
    </label>
  );
}

export function TextareaField({
  label,
  name,
  className = "",
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-white/80 ${className}`}>
      {label}
      <textarea id={name} name={name} rows={4} className={fieldClasses} {...rest} />
    </label>
  );
}

export function SelectField({
  label,
  name,
  className = "",
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-white/80 ${className}`}>
      {label}
      <select id={name} name={name} className={fieldClasses} {...rest}>
        {children}
      </select>
    </label>
  );
}
