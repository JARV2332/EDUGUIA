import type { Metadata } from "next";
import { AboutSection } from "@/components/edukids/home/about-section";
import { AreasSection } from "@/components/edukids/home/areas-section";
import { AudiencesSection } from "@/components/edukids/home/audiences-section";
import { ContactSection } from "@/components/edukids/home/contact-section";
import { HeroSection } from "@/components/edukids/home/hero-section";
import { StenamSection } from "@/components/edukids/home/stenam-section";
import { StoriesSection } from "@/components/edukids/home/stories-section";
import { OrganizationJsonLd } from "@/components/landing/landing-json-ld";
import { LandingFooter, LandingHeader, LandingLayout } from "@/components/landing/landing-shell";
import { CURATED_STORIES, type StoryItem } from "@/lib/edukids/content";
import { getPublicContacto } from "@/lib/landing/get-contacto";
import { getPublicGaleria, type GaleriaItem } from "@/lib/landing/get-galeria";

export const dynamic = "force-dynamic";

const description =
  "Educación STENAM, robótica, programación e IA para mentes de 7 a 99 años. Un programa de I.T.E. (Instituto de Tecnología & Educación).";

export const metadata: Metadata = {
  title: "EDUKIDS | El futuro no se memoriza, se construye",
  description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://edukidsgt.com"),
  openGraph: {
    title: "EDUKIDS | El futuro no se memoriza, se construye",
    description,
    type: "website",
    locale: "es_GT",
    siteName: "EDUKIDS",
    images: [
      {
        url: "/wp-content/uploads/2021/09/imagen-2_optimized.png",
        width: 1200,
        height: 630,
        alt: "Estudiantes de EDUKIDS construyendo un prototipo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EDUKIDS | El futuro no se memoriza, se construye",
    description,
    images: ["/wp-content/uploads/2021/09/imagen-2_optimized.png"],
  },
};

function storiesFromGallery(galeria: GaleriaItem[]): StoryItem[] {
  const fromGallery: StoryItem[] = galeria.map((item) => ({
    id: `galeria-${item.id}`,
    category: "proyectos",
    title: item.alt_text || "Actividad EDUKIDS",
    text: "Registro de la galería del programa.",
    image: item.imagen_url,
    imageAlt: item.alt_text || "Actividad de EDUKIDS",
  }));

  const seen = new Set<string>();
  return [...CURATED_STORIES, ...fromGallery].filter((item) => {
    if (seen.has(item.image)) return false;
    seen.add(item.image);
    return true;
  });
}

export default async function HomePage() {
  const [contacto, galeria] = await Promise.all([getPublicContacto(), getPublicGaleria()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://edukidsgt.com";

  return (
    <LandingLayout pageClass="landing-page--home">
      <OrganizationJsonLd
        siteUrl={siteUrl}
        logoUrl="/assets/logo-edukids.png"
        description={description}
      />
      <LandingHeader current="inicio" />
      <main id="main-content">
        <HeroSection />
        <AboutSection />
        <StenamSection />
        <AreasSection />
        <AudiencesSection />
        <StoriesSection items={storiesFromGallery(galeria)} />
        <ContactSection facebookUrl={contacto.facebook_url} />
      </main>
      <LandingFooter />
    </LandingLayout>
  );
}
