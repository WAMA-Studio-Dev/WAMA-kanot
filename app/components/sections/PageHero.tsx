export default function PageHero({ title }: { title: string }) {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-kanot-navy">
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

      <h1 className="relative z-10 px-4 text-center text-[12vw] sm:text-[9vw] md:text-[7vw] font-black uppercase leading-[0.9] tracking-tighter text-kanot-pink">
        {title}
      </h1>
    </section>
  );
}
