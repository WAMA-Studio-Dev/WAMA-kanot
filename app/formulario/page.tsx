import Navbar from "@/app/components/layout/Navbar";
import PageHero from "@/app/components/sections/PageHero";
import SectionHeading from "@/app/components/ui/SectionHeading";
import ContactForm from "@/app/components/formulario/ContactForm";

export default function FormularioPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHero
          title="Formulario"
          description={["Cuéntanos quién eres y qué te interesa"]}
        />

        <section className="bg-kanot-navy px-6 py-20 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-10">
            <SectionHeading
              kicker="Contacto"
              title="¿Quieres formar parte de ByKanot?"
              description="Rellena el formulario y cuéntanos qué te interesa: te contactaremos lo antes posible."
            />

            <ContactForm />
          </div>
        </section>
      </main>
    </>
  );
}
