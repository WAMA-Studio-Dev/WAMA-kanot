import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/app/components/layout/Navbar";
import SectionHeading from "@/app/components/ui/SectionHeading";
import ScrollReveal from "@/app/components/ui/ScrollReveal";
import CtaButton from "@/app/components/ui/CtaButton";
import ProductoCard from "@/app/components/merch/ProductoCard";
import { InstagramIcon, WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import {
  MERCH_INSTAGRAM,
  MERCH_INSTAGRAM_DM,
  merchGaleria,
  productos,
  whatsappUrl,
} from "@/app/data/merch";

const MENSAJE_DUDAS = "¡Hola! Tengo una duda sobre el merch de ByKanot.";

export const metadata: Metadata = {
  title: "Merch | ByKanot",
  description:
    "Nuevo merch ByKanot temporada 26/27: camiseta 15 €, pantalón 25 € y pack completo 35 €.",
};

// Two landscape photos stacked on the left, the tall back shot on the right.
const GALERIA_CELDAS = [
  "aspect-[4/3] sm:aspect-auto sm:col-span-2 sm:col-start-1 sm:row-start-1",
  "aspect-[4/3] sm:aspect-auto sm:col-span-2 sm:col-start-1 sm:row-start-2",
  "aspect-[3/4] sm:aspect-auto sm:col-start-3 sm:row-span-2 sm:row-start-1",
];

export default function MerchPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-kanot-navy px-6 pt-32 pb-16 md:px-12 md:pt-40 lg:px-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-kanot-pink/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-kanot-electric/15 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div className="flex flex-col gap-8">
              <SectionHeading
                kicker="Nuevo · Temporada 26/27"
                title="Merch"
              />

              <ScrollReveal delay={0.1}>
                <dl className="grid grid-cols-3 gap-3">
                  {[
                    { k: "Camiseta", v: "15 €" },
                    { k: "Pantalón", v: "25 €" },
                    { k: "Pack", v: "35 €", destacado: true },
                  ].map((item) => (
                    <div
                      key={item.k}
                      className={`rounded-2xl border px-4 py-3 backdrop-blur-md ${
                        item.destacado
                          ? "border-kanot-pink/60 bg-kanot-pink/10"
                          : "border-white/10 bg-black/20"
                      }`}
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                        {item.k}
                      </dt>
                      <dd
                        className={`text-2xl font-black md:text-3xl ${
                          item.destacado ? "text-kanot-pink" : "text-white"
                        }`}
                      >
                        {item.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className="flex flex-wrap gap-3">
                <CtaButton href="#productos" variant="glow">
                  Elige tu talla
                </CtaButton>
                <CtaButton
                  href={whatsappUrl(MENSAJE_DUDAS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                >
                  <WhatsAppIcon className="mr-2 h-4 w-4" />
                  Dudas sobre tallaje
                </CtaButton>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15}>
              <div className="grid h-[420px] grid-cols-5 grid-rows-6 gap-3 sm:h-[520px]">
                <div className="relative col-span-3 row-span-4 overflow-hidden rounded-3xl border border-white/10 shadow-xl shadow-black/30">
                  <Image
                    src="/imagenes/merch/camiseta-detalle.jpg"
                    alt="Detalle del escudo ByKanot en la camiseta"
                    fill
                    priority
                    sizes="(max-width: 1024px) 60vw, 330px"
                    className="object-cover"
                  />
                </div>
                <div className="relative col-span-2 row-span-6 overflow-hidden rounded-3xl border border-white/10 shadow-xl shadow-black/30">
                  <Image
                    src="/imagenes/merch/pantalon.jpg"
                    alt="Pantalón ByKanot"
                    fill
                    priority
                    sizes="(max-width: 1024px) 40vw, 220px"
                    className="object-cover"
                  />
                </div>
                <div className="relative col-span-3 row-span-2 overflow-hidden rounded-3xl border border-white/10 shadow-xl shadow-black/30">
                  <Image
                    src="/imagenes/merch/camiseta-doblada.jpg"
                    alt="Camisetas ByKanot dobladas"
                    fill
                    sizes="(max-width: 1024px) 60vw, 330px"
                    className="object-cover"
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Productos */}
        <section
          id="productos"
          className="scroll-mt-24 bg-kanot-navy-deep px-6 py-20 md:px-12 lg:px-20"
        >
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              kicker="Reserva"
              title="Elige tu look"
              description="Escoge la talla y reserva por WhatsApp con el mensaje ya escrito."
            />

            <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
              {productos.map((producto, i) => (
                <ScrollReveal key={producto.id} delay={i * 0.08} className="h-full">
                  <ProductoCard producto={producto} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Detalles */}
        <section className="bg-kanot-navy px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading kicker="Detalles" title="Así es" />
            <div className="mt-10 grid gap-4 sm:h-[560px] sm:grid-cols-3 sm:grid-rows-2">
              {merchGaleria.map((img, i) => (
                <ScrollReveal
                  key={img.src}
                  delay={i * 0.08}
                  className={`relative overflow-hidden rounded-3xl border border-white/10 ${GALERIA_CELDAS[i]}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-kanot-navy-deep px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-kanot-pink/15 via-transparent to-kanot-electric/15 p-8 md:grid-cols-[1fr_280px] md:p-12">
            <ScrollReveal className="flex flex-col gap-5">
              <h2 className="text-3xl font-black uppercase tracking-tight text-kanot-pink sm:text-4xl md:text-5xl">
                ¿Dudas con la talla?
              </h2>
              <p className="max-w-xl text-base text-white/80 md:text-lg">
                Para reservas o dudas sobre tallaje, escríbenos por WhatsApp al{" "}
                <strong className="text-white">679 507 935</strong>. También puedes
                escribirnos a <strong className="text-white">@{MERCH_INSTAGRAM}</strong> en
                Instagram.
              </p>
              <div className="flex flex-wrap gap-3">
                <CtaButton
                  href={whatsappUrl(MENSAJE_DUDAS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="glow"
                >
                  <WhatsAppIcon className="mr-2 h-4 w-4" />
                  WhatsApp 679 507 935
                </CtaButton>
                <CtaButton
                  href={MERCH_INSTAGRAM_DM}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                >
                  <InstagramIcon className="mr-2 h-4 w-4" />
                  @{MERCH_INSTAGRAM}
                </CtaButton>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="mx-auto w-full max-w-[280px]">
              <a
                href="/imagenes/merch/cartel-merch.jpg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver el cartel del merch en grande"
                className="group block overflow-hidden rounded-2xl border border-white/10 shadow-xl shadow-black/30"
              >
                <Image
                  src="/imagenes/merch/cartel-merch.jpg"
                  alt="Cartel del nuevo merch ByKanot temporada 26/27 con precios y tallas"
                  width={1080}
                  height={1350}
                  sizes="280px"
                  className="h-auto w-full rotate-0 transition-transform duration-500 group-hover:scale-105"
                />
              </a>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
