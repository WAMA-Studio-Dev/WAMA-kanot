import Navbar from "@/app/components/layout/Navbar";
import PageHero from "@/app/components/sections/PageHero";

export default function PodcastPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero title="Podcast" />
      </main>
    </>
  );
}
