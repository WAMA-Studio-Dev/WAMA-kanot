"use client";

import { useState } from "react";
import GaleriaLightbox from "@/app/components/temporadas/GaleriaLightbox";
import {
  PATTERN_20,
  SIZE_CLASSES,
  type Size,
} from "@/app/components/temporadas/collagePatterns";

export default function GaleriaCollage({
  images,
  pattern = PATTERN_20,
}: {
  images: string[];
  pattern?: Size[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div
        className="grid grid-flow-row-dense grid-cols-2 auto-rows-[130px] gap-3 sm:auto-rows-[140px] sm:gap-4 md:grid-cols-4 md:auto-rows-[150px]"
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-kanot-navy-deep transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.06] hover:shadow-2xl hover:shadow-black/60 ${SIZE_CLASSES[pattern[i] ?? "normal"]}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading={i < 6 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <GaleriaLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
