const MAPS_QUERY = "Sala Even, C/ José Díaz, 5, Sevilla";
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(MAPS_QUERY)}&output=embed`;
const MAPS_SEARCH_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAPS_QUERY)}`;

export default function ComoLlegar() {
  return (
    <section className="bg-[#9c1e53] px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
          ¿Cómo llegar? —
        </h2>

        <div className="mt-10 flex flex-col items-start gap-3 text-left">
          <p className="text-lg font-bold text-white sm:text-xl">📍 Sala Even. Sevilla.</p>
          <p className="max-w-2xl text-base text-white/80 sm:text-lg">
            La Sala Even en Sevilla ofrece un amplio espacio versátil para eventos. Situada en la
            C/ José Díaz, 5, este recinto proporciona un marco único a solo unos minutos del
            centro de la ciudad.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={MAPS_SEARCH_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-black px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-kanot-navy-deep"
          >
            Abrir en Google Maps
          </a>
        </div>

        <div className="relative mt-12 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 sm:aspect-[16/9]">
          <iframe
            src={MAPS_EMBED_SRC}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de ubicación — Sala Even, Sevilla"
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
