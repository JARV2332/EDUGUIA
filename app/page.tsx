import type { Metadata } from "next";
import Link from "next/link";
import { getPublicHome } from "@/lib/landing/get-home";
import { getPublicFaq } from "@/lib/landing/get-faq";
import { getPublicGaleria } from "@/lib/landing/get-galeria";
import { getPublicCursos } from "@/lib/lms/get-public-cursos";
import { PublicCursoCardView } from "@/components/landing/public-curso-card";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EduKids GT | Robótica y STEAM para niños",
  description: "EduKids GT - Robótica educativa y STEAM para niños en Guatemala",
};

export default async function HomePage() {
  const home = await getPublicHome();
  const cursos = await getPublicCursos();
  const cursosDestacados = cursos.slice(0, 3);
  const faqItems = (await getPublicFaq()).slice(0, 4);
  const galeriaPreview = (await getPublicGaleria()).slice(0, 4);

  return (
    <LandingLayout pageClass="landing-page--home">
      <LandingHeader current="inicio" />
      <main className="site-main">
        <section className="home-hero" style={{ backgroundImage: `url('${home.hero_bg_url}')` }}>
          <div className="home-hero__overlay"></div>
          <div className="home-hero__content landing-content">
            <p className="home-hero__tagline">{home.hero_tagline}</p>
            <h1 className="home-hero__headline">Robótica y STEAM para niños en Guatemala</h1>
            <p className="home-hero__text">{home.hero_text}</p>
            <div className="home-hero__actions">
              <Link className="btn-primary" href={home.hero_btn_href}>
                {home.hero_btn_text} <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
              <Link className="btn-secondary" href="/comunicate-con-nosotros/">
                Inscribirse
              </Link>
            </div>
          </div>
        </section>

        <section className="home-stats" aria-label="Datos de EduKids">
          <div className="landing-content home-stats__inner">
            <div className="home-stats__item">
              <strong>4–17</strong>
              <span>Años de edad</span>
            </div>
            <div className="home-stats__item">
              <strong>STEAM</strong>
              <span>Robótica y programación</span>
            </div>
            <div className="home-stats__item">
              <strong>Guatemala</strong>
              <span>Empresa guatemalteca</span>
            </div>
            <div className="home-stats__item">
              <strong>Maker</strong>
              <span>Método científico</span>
            </div>
          </div>
        </section>

        <section id="nosotros" className="home-section home-section--light">
          <div className="landing-content">
            <div className="home-split">
              <div className="home-split__media">
                <img
                  src={home.about_img_main}
                  alt="Niños aprendiendo robótica"
                  loading="lazy"
                  className="home-split__img-main"
                />
                <div className="home-split__img-grid">
                  <img src={home.about_img_secondary_1} alt="" loading="lazy" />
                  <img src={home.about_img_secondary_2} alt="" loading="lazy" />
                </div>
              </div>
              <div className="home-split__text">
                <span className="home-label">Sobre nosotros</span>
                <h2 className="section-title" style={{ textAlign: "left", marginBottom: 20 }}>
                  Nuestra historia
                </h2>
                <p>{home.about_paragraph_1}</p>
                <p>{home.about_paragraph_2}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section home-section--accent">
          <div className="landing-content">
            <div className="home-split home-split--reverse">
              <div className="home-split__text">
                <span className="home-label home-label--light">Objetivos</span>
                <h2 className="section-title section-title--light" style={{ textAlign: "left", marginBottom: 20 }}>
                  Nuestro enfoque
                </h2>
                <p>{home.enfoque_text}</p>
              </div>
              <div className="home-split__media">
                <img
                  src={home.enfoque_image_url}
                  alt="Estudiantes de EduKids trabajando en equipo"
                  loading="lazy"
                  className="home-split__img-main"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="home-section home-section--pattern">
          <div className="landing-content">
            <div className="home-split">
              <div className="home-split__media">
                <img src={home.metodo_image_url} alt="Estudiantes aplicando el metodo EduKids" loading="lazy" className="home-split__img-main" />
              </div>
              <div className="home-split__text">
                <span className="home-label">Innovación educativa</span>
                <h2 className="section-title" style={{ textAlign: "left", marginBottom: 20 }}>
                  Método educativo
                </h2>
                <p>{home.metodo_text}</p>
                <Link className="btn-primary" href="/comunicate-con-nosotros/" style={{ marginTop: 8 }}>
                  Aplicar al programa
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="cursos" className="home-section home-section--light">
          <div className="landing-content" style={{ paddingBottom: 0 }}>
            <span className="home-label">Programas</span>
            <h2 className="section-title" style={{ textAlign: "left", marginBottom: 12 }}>
              Nuestros cursos
            </h2>
            <p className="page-intro" style={{ marginTop: 0, marginBottom: 32, textAlign: "left" }}>
              Robótica, programación y STEAM para que cada niño pase de consumidor a creador de tecnología.
            </p>
            <div className="courses-grid">
              {cursosDestacados.map((curso) => (
                <PublicCursoCardView key={curso.id} curso={curso} />
              ))}
              {cursosDestacados.length === 0 && (
                <>
                  <article className="course-card">
                    <div className="course-card__image">
                      <img
                        src="/wp-content/uploads/2020/08/CodingCritters-LearningResources-scaled.jpg"
                        alt="Robótica preescolar"
                        loading="lazy"
                      />
                    </div>
                    <div className="course-card__body">
                      <h3 className="course-card__title">Robótica preescolar</h3>
                      <p className="course-card__meta">
                        <strong>Dirigido a:</strong> Niños y niñas desde 3 años
                      </p>
                      <p className="course-card__desc">
                        Desarrollo de habilidades motrices finas, espaciales y lógicas mediante programación.
                      </p>
                    </div>
                  </article>
                  <article className="course-card">
                    <div className="course-card__image">
                      <img
                        src="/wp-content/uploads/2020/08/STEAMlogo_1024x1024.png"
                        alt="Ingeniería preescolar"
                        loading="lazy"
                      />
                    </div>
                    <div className="course-card__body">
                      <h3 className="course-card__title">Ingeniería en preescolar</h3>
                      <p className="course-card__meta">
                        <strong>Dirigido a:</strong> 4 a 6 años
                      </p>
                      <p className="course-card__desc">
                        Fortalecimiento de habilidades motoras y cognitivas con kits y proyectos STEAM.
                      </p>
                    </div>
                  </article>
                </>
              )}
            </div>
            <p style={{ textAlign: "center", marginBottom: 0 }}>
              <Link className="btn-primary" href="/servicios/">
                Ver todos los cursos <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </p>
          </div>
        </section>

        <section className="home-section home-section--pattern">
          <div className="landing-content" style={{ paddingBottom: 0 }}>
            <span className="home-label">Experiencias</span>
            <h2 className="section-title" style={{ textAlign: "left", marginBottom: 24 }}>
              Momentos en EduKids
            </h2>
            <div className="gallery-grid home-gallery-preview">
              {galeriaPreview.map((item) => (
                <figure key={item.id} className="gallery-item">
                  <img src={item.imagen_url} alt={item.alt_text || "Actividad EduKids"} loading="lazy" />
                </figure>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: 28, marginBottom: 0 }}>
              <Link className="btn-primary" href="/galeria/">
                Ver galería completa <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </p>
          </div>
        </section>

        <section id="faq" className="home-section home-section--light">
          <div className="landing-content" style={{ paddingBottom: 0 }}>
            <span className="home-label">Dudas frecuentes</span>
            <h2 className="section-title" style={{ textAlign: "left", marginBottom: 24 }}>
              Preguntas comunes
            </h2>
            <div className="home-faq">
              {faqItems.map((item) => (
                <details key={item.id} className="home-faq__item">
                  <summary className="home-faq__question">{item.pregunta}</summary>
                  <p className="home-faq__answer">{item.respuesta}</p>
                </details>
              ))}
            </div>
            <p style={{ marginTop: 24, marginBottom: 0 }}>
              <Link href="/preguntas-frecuentes/" className="home-faq__more">
                Ver todas las preguntas <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </p>
          </div>
        </section>

        <section id="aprendizaje" className="home-section home-section--lms">
          <div className="landing-content">
            <span className="home-label">Campus virtual</span>
            <h2 className="section-title" style={{ textAlign: "left", marginBottom: 12 }}>
              Área de aprendizaje EduKids
            </h2>
            <p className="page-intro" style={{ marginTop: 0, marginBottom: 28 }}>
              Entorno en línea para cursos de robótica y STEAM: clases grabadas, materiales, actividades y seguimiento
              docente.
            </p>
            <div className="lms-access-grid lms-access-grid--compact">
              <Link className="lms-access-card" href="/campus/login?role=estudiante">
                <span className="lms-access-card__icon" aria-hidden="true">
                  <i className="fas fa-user-graduate"></i>
                </span>
                <h3>Estudiante</h3>
                <p>Ver mis cursos, clases y tareas.</p>
                <span className="lms-access-card__link">
                  Iniciar sesión <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </span>
              </Link>
              <Link className="lms-access-card" href="/campus/login?role=lms_docente">
                <span className="lms-access-card__icon" aria-hidden="true">
                  <i className="fas fa-chalkboard-teacher"></i>
                </span>
                <h3>Docente</h3>
                <p>Subir materiales, clases y tareas del campus.</p>
                <span className="lms-access-card__link">
                  Iniciar sesión <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </span>
              </Link>
            </div>
            <p className="lms-access-note">
              ¿Primera vez o necesitas otro acceso? Entra por el{" "}
              <Link href="/acceso">hub de acceso</Link> (administradores, EDUGUIA y más).
            </p>
          </div>
        </section>

        <section className="home-section home-section--eduguia">
          <div className="landing-content">
            <div className="home-eduguia-card">
              <div className="home-eduguia-card__text">
                <span className="home-label home-label--light">Para docentes</span>
                <h2>EDUGUIA — inclusión educativa con IA</h2>
                <p>
                  Plataforma de apoyo docente con evaluaciones adaptativas, seguimiento de progreso y herramientas de
                  inclusión para acompañar a estudiantes con necesidades diversas de aprendizaje.
                </p>
                <Link className="btn-primary" href="/eduguia">
                  Conocer EDUGUIA <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section home-section--light">
          <div className="landing-content" style={{ paddingBottom: 0 }}>
            <div className="landing-cta">
              <h3>¿Listo para inscribir a tu hijo o hija?</h3>
              <p>Escríbenos y te orientamos sobre el curso ideal para su edad e intereses.</p>
              <Link className="btn-primary" href="/comunicate-con-nosotros/">
                Comunícate con nosotros
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
