import Navbar from "@/app/components/layout/Navbar";
import PageHero from "@/app/components/sections/PageHero";
import YoutubeChannelSection from "@/app/components/podcast/YoutubeChannelSection";

export default function PodcastPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          title="Podcast"
          description={[
            "Conversaciones con bailarines, artistas y profesionales del sector.",
            "Hablamos sobre experiencias, competiciones, entrenamiento, creatividad y todo lo que rodea al mundo de la danza.",
          ]}
          videoSrc="/videos/podcast-hero.mp4"
          poster="/imagenes/hero/podcast-hero-poster.jpg"
        />
        <YoutubeChannelSection />
      </main>
    </>
  );
}
