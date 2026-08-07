import ScrollIndicator from "@/app/components/ui/ScrollIndicator";

const DEFAULT_VIDEO_SRC = "/imagenes/fondos/fondo-hero.mov";

export default function PageHero({
  title,
  description,
  videoSrc = DEFAULT_VIDEO_SRC,
  poster = videoSrc === DEFAULT_VIDEO_SRC ? "/imagenes/hero/fondo-hero.jpg" : undefined,
}: {
  title?: string;
  description?: string[];
  videoSrc?: string;
  poster?: string;
}) {
  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center gap-6 overflow-hidden bg-kanot-navy">
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
        src={videoSrc}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-kanot-navy-deep/40 via-transparent to-kanot-navy" />

      {title && (
        <h1 className="relative z-10 px-4 text-center text-[12vw] sm:text-[9vw] md:text-[7vw] font-black uppercase leading-[0.9] tracking-tighter text-kanot-pink">
          {title}
        </h1>
      )}

      {description && (
        <div className="relative z-10 flex max-w-2xl flex-col gap-3 px-4 text-center">
          {description.map((paragraph) => (
            <p key={paragraph} className="text-base font-medium text-white/90 md:text-xl">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      <ScrollIndicator />
    </section>
  );
}
