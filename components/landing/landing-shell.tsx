import Link from "next/link";
import Script from "next/script";
import type { ReactNode } from "react";
import { ISABEL_APP_URL } from "@/lib/constants/isabel";
import { getPublicContacto } from "@/lib/landing/get-contacto";

type NavKey = "inicio" | "servicios" | "galeria" | "portafolio" | "faq" | "contacto";

export async function LandingLayout({
  children,
  pageClass,
}: {
  children: ReactNode;
  pageClass: string;
}) {
  const contacto = await getPublicContacto();

  return (
    <div
      className={`wp-static-export landing-page ${pageClass} min-h-screen`}
      data-whatsapp-url={contacto.whatsapp_url}
    >
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      <link rel="stylesheet" href="/assets/site.css" />
      <link rel="stylesheet" href="/assets/eduguia-theme.css" />
      <link rel="stylesheet" href="/assets/landing-content.css" />
      {children}
      <Script src="/assets/landing-whatsapp.js" strategy="afterInteractive" />
      <Script id="landing-nav-toggle" strategy="afterInteractive">{`
        document.querySelector('[data-nav-toggle]')?.addEventListener('click', function () {
          var nav = document.getElementById('site-nav');
          if (!nav) return;
          var open = nav.classList.toggle('is-open');
          this.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      `}</Script>
    </div>
  );
}

export function LandingHeader({ current }: { current?: NavKey }) {
  const link = (key: NavKey, href: string, label: string) => (
    <Link href={href} aria-current={current === key ? "page" : undefined}>
      {label}
    </Link>
  );

  return (
    <header className="site-header" role="banner">
      <div className="site-header__bar">
        <Link className="site-logo" href="/" aria-label="EduKids - Inicio">
          <img src="/assets/logo-edukids.png" alt="EduKids" width={140} height={64} loading="eager" />
        </Link>
        <button className="site-nav-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" data-nav-toggle>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className="site-nav" id="site-nav" aria-label="Principal">
          {link("inicio", "/", "Inicio")}
          {link("servicios", "/servicios/", "Servicios")}
          {link("galeria", "/galeria/", "Galería")}
          {link("portafolio", "/portafolio/", "Portafolio")}
          {link("faq", "/preguntas-frecuentes/", "FAQ")}
          {link("contacto", "/comunicate-con-nosotros/", "Contacto")}
        </nav>
        {current === "inicio" ? (
          <>
            <a
              className="site-header__cta site-header__cta--secondary"
              href={ISABEL_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              ISABEL
            </a>
            <Link className="site-header__cta site-header__cta--secondary" href="/eduguia">
              EDUGUIA
            </Link>
            <Link className="site-header__cta" href="/comunicate-con-nosotros/">
              Inscribirse
            </Link>
          </>
        ) : (
          <>
            <a
              className="site-header__cta site-header__cta--secondary"
              href={ISABEL_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              ISABEL
            </a>
            <Link className="site-header__cta" href="/eduguia">
              EDUGUIA
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export async function LandingFooter() {
  const contacto = await getPublicContacto();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src="/assets/logo-edukids.png" alt="EduKids" width={120} height={72} loading="lazy" />
          <p>{contacto.footer_text}</p>
        </div>
        <div className="site-footer__links">
          <a href={contacto.facebook_url} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href={contacto.instagram_url} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href={contacto.whatsapp_url} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
        <p className="site-footer__copy">{contacto.copyright_text}</p>
      </div>
    </footer>
  );
}
