import type { ReactNode } from "react";

export default function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-kanot-pink/20 bg-black/30 backdrop-blur-md px-4 py-1.5 text-xs md:text-sm font-semibold uppercase tracking-wide text-kanot-pink">
      {children}
    </span>
  );
}
