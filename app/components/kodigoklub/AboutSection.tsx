import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="bg-kanot-navy-deep px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative mx-auto h-14 w-52 md:h-16 md:w-60">
          <Image
            src="/imagenes/kodigoklub/lettering-blanco.png"
            alt="Kodigo Klub"
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>

        <h2 className="mt-6 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
          Música. Baile. Comunidad.
        </h2>

        <p className="mt-4 text-base text-white/70 md:text-lg">
          Kodigo Klub es el espacio de baile de ByKanot: clases semanales para coger nivel durante todo el año
          y noches de club donde crews, alumnos y curiosos comparten la misma pista. Un solo code, un dancefloor
          para todos.
        </p>
      </div>
    </section>
  );
}
