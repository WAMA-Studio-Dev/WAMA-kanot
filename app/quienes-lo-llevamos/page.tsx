import Navbar from "@/app/components/layout/Navbar";
import PageHero from "@/app/components/sections/PageHero";

export default function QuienesLoLlevamosPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero title="Quiénes lo llevamos" />
      </main>
    </>
  );
}
