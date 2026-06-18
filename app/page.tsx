import type { Metadata } from "next";
import Link from "next/link";
import { getPublicHome } from "@/lib/landing/get-home";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EduKids GT | Robótica y STEAM para niños",
  description: "EduKids GT - Robótica educativa y STEAM para niños en Guatemala",
};

export default async function HomePage() {
  const home = await getPublicHome();

  return (
    <LandingLayout pageClass="landing-page--home">
      <LandingHeader current="inicio" />
      <main className="site-main">
        <section className="home-hero" style={{ backgroundImage: `url('${home.hero_bg_url}')` }}>
          <div className="home-hero__overlay"></div>
          <div className="home-hero__content landing-content">
            <p className="home-hero__tagline">{home.hero_tagline}</p>
            <img
              src={home.hero_logo_url}
              alt="EduKids"
              className="home-hero__logo"
              width={280}
              height={280}
              loading="eager"
            />
            <p className="home-hero__text">{home.hero_text}</p>
            <Link className="btn-primary" href={home.hero_btn_href}>
              {home.hero_btn_text} <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
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
                <img src={home.metodo_image_url} alt="EduKids" loading="lazy" className="home-split__img-logo" />
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
            <div className="lms-access-grid">
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
              <Link className="lms-access-card lms-access-card--admin" href="/campus/login?role=admin">
                <span className="lms-access-card__icon" aria-hidden="true">
                  <i className="fas fa-shield-alt"></i>
                </span>
                <h3>Administrador</h3>
                <p>Crear cursos y matricular alumnos.</p>
                <span className="lms-access-card__link">
                  Acceso admin <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </span>
              </Link>
            </div>
            <p className="lms-access-note">
              ¿Primera vez? Pide al administrador tu usuario y contraseña, o entra por{" "}
              <Link href="/acceso"> el hub de acceso</Link>.
            </p>
          </div>
        </section>

        <section className="home-section home-section--eduguia">
          <div className="landing-content">
            <div className="home-eduguia-card">
              <div className="home-eduguia-card__text">
                <h2>Actualización docente</h2>
                <p>
                  Los docentes se enfrentan cada día a nuevos retos. Por eso deben contar con herramientas y métodos
                  vanguardistas para acompañar a sus estudiantes.
                </p>
                <Link className="btn-primary" href="/login">
                  EDUGUIA
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
