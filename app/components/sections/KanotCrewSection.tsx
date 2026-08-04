import TeamGrid from "@/app/components/kanotcrew/TeamGrid";
import TemporadasList from "@/app/components/kanotcrew/TemporadasList";

export default function KanotCrewSection() {
  return (
    <section id="kanotcrew" className="scroll-mt-28 bg-kanot-navy px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl divide-y divide-white/10">
        <TeamGrid />
        <TemporadasList />
      </div>
    </section>
  );
}
