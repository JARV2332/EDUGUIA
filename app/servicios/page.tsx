export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPublicCursos } from "@/lib/lms/get-public-cursos";
import { PublicCursoCardView } from "@/components/landing/public-curso-card";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";

export default async function ServiciosPage() {
  const cursosPublicados = await getPublicCursos();
  const showStaticFallback = cursosPublicados.length === 0;

  return (
    <LandingLayout pageClass="landing-page--servicios">
      <LandingHeader current="servicios" />
      <main className="site-main">
        <header className="page-hero">
          <div className="page-hero__inner">
            <h1>Cursos y talleres</h1>
            <p>Robótica educativa, programación y STEAM para que cada niño pase de consumidor a creador de tecnología.</p>
          </div>
        </header>

        <div className="landing-content">
          <p className="page-intro">
            En <strong>EduKids</strong> contamos con profesores apasionados por la cultura maker. Nuestro método se basa en el método científico: motivamos al alumno a mejorar su <strong>autonomía y pensamiento crítico</strong>, dejando que ellos marquen los objetivos de cada proyecto.
          </p>

          <h2 className="section-title">Lo que puedes aprender en nuestros cursos</h2>

          <div className="courses-grid">
            {cursosPublicados.map((curso) => (
              <PublicCursoCardView key={curso.id} curso={curso} />
            ))}

            {showStaticFallback && (
              <>
                <article className="course-card">
                  <div className="course-card__image">
                    <img src="/wp-content/uploads/2020/08/CodingCritters-LearningResources-scaled.jpg" alt="Robótica preescolar" loading="lazy" />
                  </div>
                  <div className="course-card__body">
                    <h3 className="course-card__title">Robótica preescolar</h3>
                    <p className="course-card__meta"><strong>Dirigido a:</strong> Niños y niñas desde 3 años</p>
                    <p className="course-card__meta"><strong>Duración:</strong> 6 clases</p>
                    <p className="course-card__desc">Desarrollo de habilidades motrices finas, espaciales y lógicas mediante programación desde casa.</p>
                  </div>
                </article>
                <article className="course-card">
                  <div className="course-card__image">
                    <img src="/wp-content/uploads/2020/08/STEAMlogo_1024x1024.png" alt="Ingeniería preescolar" loading="lazy" />
                  </div>
                  <div className="course-card__body">
                    <h3 className="course-card__title">Ingeniería en preescolar</h3>
                    <p className="course-card__meta"><strong>Dirigido a:</strong> 4 a 6 años</p>
                    <p className="course-card__meta"><strong>Inversión:</strong> Q225 · 10 clases virtuales</p>
                    <p className="course-card__desc">Fortalecimiento de habilidades motoras y cognitivas con nuestros kits y proyectos STEAM.</p>
                  </div>
                </article>
              </>
            )}
          </div>

          <section className="features-band" aria-labelledby="talleres-heading">
            <h2 id="talleres-heading" className="section-title">
              ¿Qué aprenden en nuestros talleres?
            </h2>
            <p className="page-intro" style={{ marginTop: 0, marginBottom: 32 }}>
              Abordamos la tecnología de forma recreativa y práctica.
            </p>
            <div className="features-grid">
              <div className="feature-item">
                <img src="/wp-content/uploads/2020/03/robotica-5.png" alt="Robótica" loading="lazy" />
                <p>Diseñar, crear, armar y programar robots con componentes electrónicos.</p>
              </div>
              <div className="feature-item">
                <img src="/wp-content/uploads/2020/03/crop-0-0-200-200-0-talleres-videojuegos.png" alt="Videojuegos" loading="lazy" />
                <p>Programar y jugar con los videojuegos que ellos mismos diseñen.</p>
              </div>
              <div className="feature-item">
                <img src="/wp-content/uploads/2020/03/icono-scratch.jpg" alt="Scratch" loading="lazy" />
                <p>Aprender programación con Scratch y proyectos STEAM integrados.</p>
              </div>
            </div>
          </section>

          <div className="landing-cta">
            <h3>¿Listo para inscribir a tu hijo o hija?</h3>
            <p>Escríbenos y te orientamos sobre el curso ideal.</p>
            <Link className="btn-primary" href="/comunicate-con-nosotros/">
              Comunícate con nosotros
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
