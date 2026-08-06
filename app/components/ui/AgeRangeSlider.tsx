"use client";

export default function AgeRangeSlider({
  label,
  name,
  value,
  onChange,
  min = 5,
  max = 80,
  className = "",
}: {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex flex-col gap-3 text-sm font-medium text-white/80 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={name}>{label}</label>
        <span className="rounded-full bg-kanot-pink px-3 py-1 text-xs font-bold text-kanot-navy">
          {value} años
        </span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="kanot-range h-2 w-full cursor-pointer rounded-full"
        style={{
          background: `linear-gradient(to right, var(--color-kanot-pink) ${percent}%, rgba(255,255,255,0.15) ${percent}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-white/40">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
