import Image from "next/image";
import Pill from "@/app/components/ui/Pill";
import CtaButton from "@/app/components/ui/CtaButton";

export default function EventShowcase() {
  return (
    <section className="bg-kanot-navy px-6 py-14 md:px-12 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="relative aspect-[1024/438] w-full overflow-hidden rounded-3xl">
          <Image
            src="/imagenes/kodigoklub/fondo.webp"
            alt="Kodigo Klub — One code, one dance floor"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Pill>16 Octubre</Pill>
          <Pill>Sala Even</Pill>
          <Pill>Sevilla</Pill>
        </div>

        <div className="mt-8 flex justify-center">
          <CtaButton href="https://instagram.com/bykanot" target="_blank" rel="noopener noreferrer">
            Más información
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
