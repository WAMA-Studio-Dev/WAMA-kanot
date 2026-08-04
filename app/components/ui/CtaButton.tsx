import type { ReactNode } from "react";

type CtaButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  target?: string;
  rel?: string;
  className?: string;
};

export default function CtaButton({
  href,
  children,
  variant = "solid",
  target,
  rel,
  className = "",
}: CtaButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 font-bold transition-colors";
  const styles =
    variant === "solid"
      ? "bg-kanot-pink text-kanot-navy hover:bg-white"
      : "border border-kanot-pink/40 text-kanot-pink hover:bg-kanot-pink hover:text-kanot-navy";

  return (
    <a href={href} target={target} rel={rel} className={`${base} ${styles} ${className}`}>
      {children}
    </a>
  );
}
