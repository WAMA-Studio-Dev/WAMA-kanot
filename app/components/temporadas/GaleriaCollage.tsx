"use client";

import { useState } from "react";
import { galeria20252026 } from "@/app/data/temporadaGaleria";
import GaleriaLightbox from "@/app/components/temporadas/GaleriaLightbox";

// Hand-tuned so every "band" below (however it groups) fills a whole number of
// rows with zero leftover cells at both grid-cols-2 (mobile) and grid-cols-4
// (sm+) — each band's tile shapes were checked to tile the row perfectly at
// both column counts, so dense packing never leaves an empty gap.
type Size = "big" | "wide" | "normal";

const SIZE_CLASSES: Record<Size, string> = {
  big: "col-span-2 row-span-2",
  wide: "col-span-2 row-span-1",
  normal: "col-span-1 row-span-1",
};

const SIZE_PATTERN: Size[] = [
  "wide", "wide", "normal", "normal", "normal", "normal",
  "big", "normal", "normal", "normal", "normal",
  "normal", "normal", "normal", "normal",
  "big", "normal", "normal", "normal", "normal",
];

export default function GaleriaCollage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div
        className="grid grid-flow-row-dense grid-cols-2 auto-rows-[130px] gap-3 sm:auto-rows-[140px] sm:gap-4 md:grid-cols-4 md:auto-rows-[150px]"
      >
        {galeria20252026.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-kanot-navy-deep transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.06] hover:shadow-2xl hover:shadow-black/60 ${SIZE_CLASSES[SIZE_PATTERN[i]]}`}
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
          images={galeria20252026}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
