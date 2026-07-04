import Image from "next/image";
import Link from "next/link";
import type { LandingHomeContent } from "@/lib/landing/get-home";

export function HomeHero({ home }: { home: LandingHomeContent }) {
  return (
    <section className="home-hero">
      <Image
        src={home.hero_bg_url}
        alt=""
        fill
        priority
        sizes="100vw"
        className="home-hero__bg"
      />
      <div className="home-hero__overlay"></div>
      <div className="home-hero__content landing-content">
        <p className="home-hero__tagline">{home.hero_tagline}</p>
        <h1 className="home-hero__headline">{home.hero_headline}</h1>
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
  );
}
