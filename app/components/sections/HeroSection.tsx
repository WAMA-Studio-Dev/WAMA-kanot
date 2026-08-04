export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative h-screen w-full overflow-hidden bg-kanot-navy scroll-mt-28"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop"
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-kanot-navy-deep/40 via-transparent to-kanot-navy" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-[18vw] sm:text-[14vw] md:text-[12vw] font-black uppercase leading-[0.85] tracking-tighter text-kanot-pink">
          ByKanot
        </h1>

        <p className="max-w-2xl text-base md:text-xl font-medium text-white/90">
          Representado por Ariadna y Enrique. Grupo de competición, cultura urbana,
          formación y creación de contenido 2026/2027.
        </p>
      </div>
    </section>
  );
}
