import Image from "next/image";

export default function KodigoKlubHero() {
  return (
    <section className="relative aspect-[1577/997] w-full overflow-hidden bg-kanot-navy">
      <Image
        src="/imagenes/kodigoklub/Foto Kodigo Klub inicio.png"
        alt="Kodigo Klub — One code, one dance floor"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
    </section>
  );
}
