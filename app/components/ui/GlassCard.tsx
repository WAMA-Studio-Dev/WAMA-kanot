import type { ReactNode } from "react";

export default function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md shadow-lg shadow-black/20 ${className}`}
    >
      {children}
    </div>
  );
}
