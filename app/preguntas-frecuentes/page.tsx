import type { Metadata } from "next";
import Link from "next/link";
import { getPublicFaq } from "@/lib/landing/get-faq";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | EduKids GT",
  description: "Respuestas a las dudas más comunes sobre cursos y talleres EduKids GT",
};

export default async function FaqPage() {
  const items = await getPublicFaq();

  return (
    <LandingLayout pageClass="landing-page--faq">
      <LandingHeader current="faq" />
      <main className="site-main">
        <header className="page-hero">
          <div className="page-hero__inner">
            <p style={{ margin: "0 0 8px", fontSize: "0.9rem", opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Las respuestas a tus dudas
            </p>
            <h1>Preguntas frecuentes</h1>
            <p>Información sobre nuestros talleres, inscripciones y metodología educativa.</p>
          </div>
        </header>

        <div className="landing-content">
          <div className="gallery-grid" style={{ marginBottom: 48 }}>
            <figure className="gallery-item">
              <img
                src="/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.20-AM-4.jpeg"
                alt="Clases EduKids"
                loading="lazy"
              />
            </figure>
            <figure className="gallery-item">
              <img
                src="/wp-content/uploads/2020/03/WhatsApp-Image-2019-12-02-at-12.44.14-AM-1.jpeg"
                alt="Taller EduKids"
                loading="lazy"
              />
            </figure>
          </div>

          <div className="features-band">
            <h2 className="section-title">Preguntas comunes</h2>
            <div className="text-block" style={{ margin: 0, textAlign: "left" }}>
              {items.map((item) => (
                <div key={item.id}>
                  <h3>{item.pregunta}</h3>
                  <p>{item.respuesta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-cta">
            <h3>¿Aún tienes dudas?</h3>
            <p>Estamos para ayudarte.</p>
            <Link className="btn-primary" href="/comunicate-con-nosotros/">
              Contactar
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
