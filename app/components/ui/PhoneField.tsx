"use client";

import { useState } from "react";

const COUNTRY_CODES = [
  { code: "ES", dial: "+34", flag: "🇪🇸" },
  { code: "PT", dial: "+351", flag: "🇵🇹" },
  { code: "FR", dial: "+33", flag: "🇫🇷" },
  { code: "IT", dial: "+39", flag: "🇮🇹" },
  { code: "DE", dial: "+49", flag: "🇩🇪" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "US", dial: "+1", flag: "🇺🇸" },
  { code: "MX", dial: "+52", flag: "🇲🇽" },
  { code: "AR", dial: "+54", flag: "🇦🇷" },
  { code: "CO", dial: "+57", flag: "🇨🇴" },
  { code: "BR", dial: "+55", flag: "🇧🇷" },
  { code: "MA", dial: "+212", flag: "🇲🇦" },
];

export default function PhoneField({
  label,
  name,
  required,
  onChange,
  className = "",
}: {
  label: string;
  name: string;
  required?: boolean;
  onChange: (fullValue: string) => void;
  className?: string;
}) {
  const [dial, setDial] = useState(COUNTRY_CODES[0].dial);
  const [number, setNumber] = useState("");

  function emit(nextDial: string, nextNumber: string) {
    onChange(nextNumber ? `${nextDial} ${nextNumber}`.trim() : "");
  }

  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-white/80 ${className}`}>
      {label}
      <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/30 transition-colors focus-within:border-kanot-pink focus-within:ring-1 focus-within:ring-kanot-pink">
        <select
          aria-label="Prefijo del país"
          value={dial}
          onChange={(e) => {
            setDial(e.target.value);
            emit(e.target.value, number);
          }}
          className="shrink-0 border-r border-white/10 bg-transparent px-2 py-3 text-sm text-white focus:outline-none"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.dial} className="bg-kanot-navy text-white">
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <input
          id={name}
          name={name}
          type="tel"
          required={required}
          value={number}
          onChange={(e) => {
            setNumber(e.target.value);
            emit(dial, e.target.value);
          }}
          placeholder="612 345 678"
          className="w-full bg-transparent px-3 py-3 text-white placeholder-white/40 focus:outline-none"
        />
      </div>
    </label>
  );
}
