import type { Metadata } from "next";
import Link from "next/link";
import { getPublicPortafolio } from "@/lib/landing/get-portafolio";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portafolio | EduKids GT",
  description: "Proyectos y trabajos de estudiantes EduKids GT",
};

export default async function PortafolioPage() {
  const items = await getPublicPortafolio();

  return (
    <LandingLayout pageClass="landing-page--portafolio">
      <LandingHeader current="portafolio" />
      <main className="site-main">
        <header className="page-hero">
          <div className="page-hero__inner">
            <h1>Portafolio</h1>
            <p>Proyectos destacados de nuestros estudiantes en robótica y programación.</p>
          </div>
        </header>

        <div className="landing-content">
          {items.map((item) => (
            <article key={item.id} className="portfolio-block">
              <div className="portfolio-gallery">
                {item.imagenes.map((img, index) => (
                  <img
                    key={`${item.id}-${index}`}
                    src={img.url}
                    alt={img.alt || item.titulo}
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="portfolio-info">
                <h4>{item.etiqueta}</h4>
                <h2>{item.titulo}</h2>
                <p>{item.descripcion}</p>
              </div>
            </article>
          ))}

          <div className="landing-cta">
            <h3>¿Te interesa un curso?</h3>
            <p>Explora nuestros programas e inscríbete.</p>
            <Link className="btn-primary" href="/servicios/">
              Ver cursos
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
