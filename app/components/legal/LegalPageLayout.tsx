import type { ReactNode } from "react";
import Navbar from "@/app/components/layout/Navbar";

export default function LegalPageLayout({
  title,
  lastUpdated = "Agosto 2026",
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-kanot-navy">
        <section className="px-6 pb-20 pt-32 md:px-12 md:pt-40 lg:px-20">
          <div className="mx-auto max-w-3xl">
            <header className="mb-12 border-b border-white/10 pb-8">
              <h1 className="text-4xl font-black uppercase tracking-tight text-kanot-pink sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-white/50">
                Última actualización: {lastUpdated}
              </p>
            </header>

            <div className="flex flex-col gap-8 text-sm leading-relaxed text-white/80 md:text-base">
              {children}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
