"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function PhotoCarousel({ photos, etiqueta }: { photos: string[]; etiqueta?: string }) {
  const [slide, setSlide] = useState<{ activeIndex: number; prevIndex: number | null }>({
    activeIndex: 0,
    prevIndex: null,
  });
  const [enteredIndex, setEnteredIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => ({ activeIndex: (s.activeIndex + 1) % photos.length, prevIndex: s.activeIndex }));
    }, 4500);
    return () => clearInterval(id);
  }, [photos.length]);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setEnteredIndex(slide.activeIndex);
      });
    });
    return () => cancelAnimationFrame(raf1);
  }, [slide.activeIndex]);

  const hasEntered = enteredIndex === slide.activeIndex;

  return (
    <section
      className="px-6 py-14 md:px-12 md:py-20"
      style={{
        backgroundColor: "#120010",
        backgroundImage: "repeating-conic-gradient(#0a0a0a 0% 25%, #9c1e53 0% 50%)",
        backgroundSize: "36px 36px",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl">
          {etiqueta && (
            <span className="absolute left-4 top-4 z-30 rounded-full bg-black/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#d6127e] backdrop-blur-sm">
              {etiqueta}
            </span>
          )}
          {photos.map((src, i) => {
            const isCurrent = i === slide.activeIndex;
            const isPrevious = i === slide.prevIndex;

            return (
              <div
                key={src}
                className="absolute inset-0"
                style={{
                  opacity: isCurrent || isPrevious ? 1 : 0,
                  zIndex: isCurrent ? 20 : isPrevious ? 10 : 0,
                  transform: isCurrent && !hasEntered ? "translateX(-100%)" : "translateX(0%)",
                  transition: isCurrent ? "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                }}
              >
                <Image
                  src={src}
                  alt="Kodigo Klub"
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                  priority
                />

                {isCurrent && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8">
                    <p className="text-center text-lg font-black uppercase tracking-wide text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] sm:text-2xl">
                      One code, one dancefloor
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
