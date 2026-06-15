import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Cursos y Talleres | EduKids GT",
  description: "Cursos de robótica, programación y STEAM para niños en Guatemala — EduKids GT",
};

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wp-static-export landing-page landing-page--servicios min-h-screen">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      <link rel="stylesheet" href="/assets/site.css" />
      <link rel="stylesheet" href="/assets/eduguia-theme.css" />
      <link rel="stylesheet" href="/assets/landing-content.css" />
      {children}
      <Script id="servicios-nav-toggle" strategy="afterInteractive">{`
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
