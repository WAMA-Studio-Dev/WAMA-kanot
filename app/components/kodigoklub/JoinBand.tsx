import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import { KODIGO_KLUB_INSTAGRAM_HREF } from "@/app/data/kodigoKlub";

export default function JoinBand() {
  return (
    <section className="bg-[#9c1e53] px-6 py-8 md:px-12 md:py-10">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl md:text-3xl">
            ¿Te unes al Kodigo?
          </h2>
          <a
            href={KODIGO_KLUB_INSTAGRAM_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Kodigo Klub"
            className="text-white/90 transition-colors hover:text-black"
          >
            <InstagramIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </a>
        </div>
        <p className="mt-3 text-sm text-white/85 md:text-base">
          Kodigo Klub es nuestro espacio para conectar la comunidad. Organizamos eventos, fiestas y experiencias
          donde el baile, la música y la cultura urbana se unen para crear momentos únicos. Porque la pista
          también es un lugar para compartir.
        </p>
      </div>
    </section>
  );
}
