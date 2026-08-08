import Image from "next/image";

type PosterItem =
  | { type: "poster"; src: string; alt: string }
  | { type: "soon" };

const posters: PosterItem[] = [
  { type: "poster", src: "/imagenes/kodigoklub/DJ SET.png", alt: "Jony Gonzalez — DJ Set" },
  { type: "poster", src: "/imagenes/kodigoklub/JUANJE y ESTELA.jpg", alt: "Juanje & Estela" },
  { type: "poster", src: "/imagenes/kodigoklub/DRAG.jpeg", alt: "The Juicy Dollz — Drag Artist" },
  { type: "poster", src: "/imagenes/kodigoklub/DIEGO Y DANI.jpg", alt: "Diego & Dani" },
  { type: "poster", src: "/imagenes/kodigoklub/ISABELA.jpg", alt: "Isabela" },
  { type: "poster", src: "/imagenes/kodigoklub/POLO Y PATRI.jpg", alt: "Polo & Patri" },
  { type: "soon" },
  { type: "soon" },
  { type: "soon" },
];

const OFFSET_BY_COLUMN = ["md:translate-y-0", "md:-translate-y-8", "md:translate-y-6"];
const ROTATE_BY_INDEX: Record<number, string> = {
  1: "md:-rotate-2",
  3: "md:rotate-1",
  5: "md:-rotate-1",
  7: "md:rotate-2",
};

export default function PosterGallery() {
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9c9d6]">Kodigo Klub</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
            Invitadxs
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
          {posters.map((item, i) => {
            const column = i % 3;
            const isFeatured = i === 4;

            return (
              <div
                key={i}
                className={`relative aspect-[4/5] w-full overflow-hidden rounded-lg shadow-2xl shadow-black/60 transition-transform ${OFFSET_BY_COLUMN[column]} ${ROTATE_BY_INDEX[i] ?? ""} ${
                  isFeatured ? "md:scale-110 z-10" : "z-0"
                }`}
              >
                {item.type === "poster" ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#9c1e53] to-black px-4 text-center">
                    <span aria-hidden className="text-2xl text-white/70">
                      ✦
                    </span>
                    <p className="text-lg font-black uppercase tracking-tight text-white sm:text-xl">
                      Próximamente
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
