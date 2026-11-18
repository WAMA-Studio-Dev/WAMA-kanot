import Navbar from "@/app/components/layout/Navbar";
import HeroSection from "@/app/components/sections/HeroSection";
import KanotCrewSection from "@/app/components/sections/KanotCrewSection";
import CodigoClubSection from "@/app/components/sections/CodigoClubSection";
import PodcastSection from "@/app/components/sections/PodcastSection";
import AppSection from "@/app/components/sections/AppSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AppSection />
        <KanotCrewSection />
        <CodigoClubSection />
        <PodcastSection />
      </main>
    </>
  );
}
