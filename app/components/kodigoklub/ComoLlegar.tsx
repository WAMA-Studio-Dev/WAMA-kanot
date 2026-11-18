import type { KodigoSala } from "@/app/data/kodigoKlub";

export default function ComoLlegar({ sala }: { sala: KodigoSala }) {
  const query = `${sala.nombre}, ${sala.direccion}`;
  const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const mapsSearchHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section className="bg-[#9c1e53] px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
          ¿Cómo llegar? —
        </h2>

        <div className="mt-10 flex flex-col items-start gap-3 text-left">
          <p className="text-lg font-bold text-white sm:text-xl">
            📍 {sala.nombre}. {sala.ciudad}.
          </p>
          <p className="max-w-2xl text-base text-white/80 sm:text-lg">{sala.descripcion}</p>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={mapsSearchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-black px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-kanot-navy-deep"
          >
            Abrir en Google Maps
          </a>
        </div>

        <div className="relative mt-12 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 sm:aspect-[16/9]">
          <iframe
            src={mapsEmbedSrc}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ubicación — ${sala.nombre}, ${sala.ciudad}`}
          />

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute -inset-3 animate-ping rounded-full bg-kanot-electric/40" />
            <span className="relative block h-4 w-4 rounded-full border-2 border-white bg-kanot-electric shadow-lg shadow-black/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
