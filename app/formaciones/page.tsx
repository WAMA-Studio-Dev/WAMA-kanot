import Navbar from "@/app/components/layout/Navbar";
import SectionHeading from "@/app/components/ui/SectionHeading";
import FormacionCard from "@/app/components/formaciones/FormacionCard";
import { formaciones } from "@/app/data/formaciones";

export default function FormacionesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-kanot-navy px-6 pt-32 pb-20 md:px-12 lg:px-20">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              kicker="ByKanot"
              title="Próximas formaciones"
              description="Elige la formación que más te interese, consulta el temario completo y apúntate en un par de clics."
            />

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {formaciones.map((formacion) => (
                <FormacionCard key={formacion.id} formacion={formacion} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
