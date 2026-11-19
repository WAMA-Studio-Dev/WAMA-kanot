"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { youtubeChannelUrl } from "@/app/data/podcast";
import { podcastVideos } from "@/app/data/podcastVideos";
import VistaSeccion from "../_components/VistaSeccion";
import PropuestasPodcast from "../_components/PropuestasPodcast";

// Episodios publicados en la web (sin los huecos de "próximamente").
const EPISODIOS_WEB = podcastVideos.filter((v) => v.url !== youtubeChannelUrl);

export default function PaginaPodcast() {
  return (
    <div className="flex flex-col gap-6">
      {/* Canal */}
      <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-black/25 p-4">
        <Image
          src="/imagenes/podcast/logo.png"
          alt="ByKanot"
          width={64}
          height={64}
          className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight">ByKanot</p>
          <p className="truncate text-xs text-white/55">@kanotcrew · Canal de baile y cultura urbana</p>
        </div>
        <a
          href={youtubeChannelUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-kanot-navy-deep transition hover:bg-white/80"
        >
          Suscribirse
        </a>
      </div>

      <p className="text-sm leading-relaxed text-white/75">
        Conversaciones con bailarines, artistas y profesionales del sector. Hablamos sobre experiencias,
        competiciones, entrenamiento, creatividad y todo lo que rodea al mundo de la danza.
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-kanot-pink">Episodios</h2>

        {/* Episodios nuevos que añaden editores/admins desde la app */}
        <VistaSeccion slug="podcast" compacto ocultarVacio />

        {/* Episodios que ya están en la web */}
        <div className="grid gap-3 sm:grid-cols-2">
          {EPISODIOS_WEB.map((v) => (
            <a
              key={v.id}
              href={v.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-3xl border border-white/10 bg-black/25 transition hover:border-kanot-pink/60"
            >
              <div className="relative aspect-video">
                <Image
                  src={v.miniatura}
                  alt={v.titulo}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-kanot-pink text-kanot-navy-deep">
                    <Play size={24} className="translate-x-0.5" fill="currentColor" />
                  </span>
                </span>
              </div>
              <p className="p-4 font-semibold">{v.titulo}</p>
            </a>
          ))}
        </div>

        <a
          href={youtubeChannelUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
        >
          Ver todos los episodios en YouTube
        </a>
      </section>

      <PropuestasPodcast />
    </div>
  );
}
