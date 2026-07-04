import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/landing/contact-form";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";
import { getPublicContacto } from "@/lib/landing/get-contacto";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comunícate con nosotros | EduKids GT",
  description: "Contacto EduKids GT — robótica y STEAM en Guatemala",
};

const CONTACT_EMAIL = "info@edukidsgt.com";

export default async function ContactoPage() {
  const contacto = await getPublicContacto();

  return (
    <LandingLayout pageClass="landing-page--contacto">
      <LandingHeader current="contacto" />
      <main className="site-main">
        <header className="page-hero">
          <div className="page-hero__inner">
            <h1>Comunícate con nosotros</h1>
            <p>Cuéntanos en qué podemos ayudarte. Te responderemos lo antes posible.</p>
          </div>
        </header>

        <div className="landing-content">
          <p className="page-intro">
            Escríbenos para inscripciones, información de cursos o alianzas. ¡Esperamos saber de ti!
          </p>

          <div className="contact-layout">
            <ContactForm />

            <aside className="contact-aside" aria-label="Otros medios de contacto">
              <h2 className="contact-aside__title">También puedes escribirnos</h2>
              <div className="contact-cards contact-cards--stacked">
                <div className="contact-card">
                  <p>
                    <strong>Facebook</strong>
                  </p>
                  <p>
                    <a href={contacto.facebook_url} target="_blank" rel="noopener noreferrer">
                      @edukidsguatemala
                    </a>
                  </p>
                </div>
                <div className="contact-card">
                  <p>
                    <strong>Instagram</strong>
                  </p>
                  <p>
                    <a href={contacto.instagram_url} target="_blank" rel="noopener noreferrer">
                      @edukids_gt
                    </a>
                  </p>
                </div>
                <div className="contact-card">
                  <p>
                    <strong>WhatsApp</strong>
                  </p>
                  <p>
                    <a href={contacto.whatsapp_url} target="_blank" rel="noopener noreferrer">
                      5988 6915
                    </a>
                  </p>
                </div>
                <div className="contact-card">
                  <p>
                    <strong>Correo</strong>
                  </p>
                  <p>
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                  </p>
                </div>
              </div>
            </aside>
          </div>

          <div className="landing-cta">
            <h3>Plataforma para docentes</h3>
            <p>Accede a EDUGUIA para herramientas de inclusión y seguimiento educativo.</p>
            <Link className="btn-primary" href="/eduguia">
              Entrar a EDUGUIA
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
