import ScrollIndicator from "@/app/components/ui/ScrollIndicator";

const DEFAULT_VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4";

export default function PageHero({
  title,
  description,
  videoSrc = DEFAULT_VIDEO_SRC,
  poster = videoSrc === DEFAULT_VIDEO_SRC ? "/imagenes/hero/fondo-hero.jpg" : undefined,
}: {
  title: string;
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

      <h1 className="relative z-10 px-4 text-center text-[12vw] sm:text-[9vw] md:text-[7vw] font-black uppercase leading-[0.9] tracking-tighter text-kanot-pink">
        {title}
      </h1>

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
