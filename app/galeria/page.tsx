import type { Metadata } from "next";
import Link from "next/link";
import { getPublicGaleria } from "@/lib/landing/get-galeria";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galería | EduKids GT",
  description: "Galería de actividades, talleres y proyectos — EduKids GT Guatemala",
};

export default async function GaleriaPage() {
  const items = await getPublicGaleria();

  return (
    <LandingLayout pageClass="landing-page--galeria">
      <LandingHeader current="galeria" />
      <main className="site-main">
        <header className="page-hero">
          <div className="page-hero__inner">
            <h1>Galería</h1>
            <p>Momentos de nuestros talleres, proyectos y experiencias STEAM con niñas y niños.</p>
          </div>
        </header>

        <div className="landing-content">
          <div className="gallery-grid">
            {items.map((item) => (
              <figure key={item.id} className="gallery-item">
                <img src={item.imagen_url} alt={item.alt_text || "Foto EduKids"} loading="lazy" />
              </figure>
            ))}
          </div>

          <div className="landing-cta" style={{ marginTop: 48 }}>
            <h3>¿Quieres que tu hijo viva estas experiencias?</h3>
            <p>Conoce nuestros cursos y talleres.</p>
            <Link className="btn-primary" href="/servicios/">
              Ver servicios
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
