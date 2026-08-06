import Image from "next/image";
import Link from "next/link";

export default function CodigoClubSection() {
  return (
    <section
      id="codigoclub"
      className="scroll-mt-28 bg-kanot-navy-deep px-6 py-20 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/kodigoklub"
          className="relative block aspect-[1577/997] w-full overflow-hidden rounded-[28px] transition-transform hover:scale-[1.01]"
        >
          <Image
            src="/imagenes/kodigoklub/Foto Kodigo Klub inicio.png"
            alt="KodigoKlub — One code, one dance floor"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority={false}
          />
        </Link>
      </div>
    </section>
  );
}
