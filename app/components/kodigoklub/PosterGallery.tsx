import Image from "next/image";

import type { KodigoPoster } from "@/app/data/kodigoKlub";

const OFFSET_BY_COLUMN = ["md:translate-y-0", "md:-translate-y-8", "md:translate-y-6"];
const ROTATE_BY_INDEX: Record<number, string> = {
  1: "md:-rotate-2",
  3: "md:rotate-1",
  5: "md:-rotate-1",
  7: "md:rotate-2",
};

export default function PosterGallery({
  posters,
  etiqueta,
}: {
  posters: KodigoPoster[];
  etiqueta?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-20 md:px-12 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(156,30,83,0.35), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9c9d6]">
            Kodigo Klub{etiqueta ? ` · ${etiqueta}` : ""}
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
            Invitadxs
          </h2>
        </div>

        {/* Flex instead of grid so an incomplete last row stays centred. */}
        <div className="mt-14 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
          {posters.length === 0 && (
            <div className="flex aspect-[4/5] w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-4rem)/3)] items-center justify-center rounded-lg bg-gradient-to-br from-[#9c1e53] to-black">
              <p className="text-lg font-black uppercase tracking-tight text-white">Próximamente</p>
            </div>
          )}
          {posters.map((item, i) => {
            const column = i % 3;
            const isFeatured = i === 4;

            return (
              <div
                key={item.src}
                className={`relative aspect-[4/5] w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-4rem)/3)] overflow-hidden rounded-lg shadow-2xl shadow-black/60 transition-transform ${OFFSET_BY_COLUMN[column]} ${ROTATE_BY_INDEX[i] ?? ""} ${
                  isFeatured ? "md:scale-110 z-10" : "z-0"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
