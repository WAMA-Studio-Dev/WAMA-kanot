import Image from "next/image";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { clubPhotos } from "@/app/data/club";

export default function GallerySection() {
  return (
    <section className="bg-kanot-navy-deep px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading kicker="Kodigo Klub" title="Así se vive" />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {clubPhotos.map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={src}
                alt="Kodigo Klub"
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
