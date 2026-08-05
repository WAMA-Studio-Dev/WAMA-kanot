import Image from "next/image";
import { youtubeChannelUrl } from "@/app/data/podcast";
import { podcastVideos } from "@/app/data/podcastVideos";

export default function YoutubeChannelSection() {
  return (
    <section className="bg-kanot-navy-deep px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-white/10 sm:h-32 sm:w-32">
            <Image
              src="/imagenes/podcast/logo.png"
              alt="ByKanot"
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                ByKanot
              </h2>
              <p className="mt-1 text-sm text-white/50">@kanotcrew · Canal de baile y cultura urbana</p>
            </div>
            <p className="max-w-xl text-sm text-white/70 sm:text-base">
              Conversaciones con bailarines, artistas y profesionales del sector.
            </p>
            <a
              href={youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-kanot-navy-deep transition-colors hover:bg-white/80"
            >
              Suscribirse
            </a>
          </div>
        </div>

        <div className="mt-10 border-b border-white/10">
          <button
            type="button"
            className="border-b-2 border-white px-1 pb-3 text-sm font-semibold text-white"
          >
            Vídeos
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {podcastVideos.map((video) => (
            <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image
                  src={video.miniatura}
                  alt={video.titulo}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                {video.duracion !== "--:--" && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                    {video.duracion}
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-2 text-sm font-bold text-white">{video.titulo}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
