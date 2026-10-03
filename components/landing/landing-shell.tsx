import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { GearCursor } from "@/components/edukids/gear-cursor";
import { SiteFooter } from "@/components/edukids/site-footer";
import { SiteHeader } from "@/components/edukids/site-header";
import { SocialFloat } from "@/components/edukids/whatsapp-float";
import type { NavKey } from "@/lib/edukids/content";
import { getPublicContacto } from "@/lib/landing/get-contacto";

const edukidsFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
      className={`${edukidsFont.className} ek-site wp-static-export landing-page ${pageClass} min-h-screen bg-brand-light text-brand-darkblue`}
    >
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" crossOrigin="anonymous" />
      <link rel="stylesheet" href="/assets/site.css" />
      <link rel="stylesheet" href="/assets/eduguia-theme.css" />
      <link rel="stylesheet" href="/assets/landing-content.css" />
      <GearCursor />
      {children}
      <SocialFloat whatsappUrl={contacto.whatsapp_url} facebookUrl={contacto.facebook_url} />
    </div>
  );
}

export function LandingHeader({ current }: { current?: NavKey }) {
  return <SiteHeader current={current} />;
}

export async function LandingFooter() {
  const contacto = await getPublicContacto();
  return <SiteFooter contacto={contacto} />;
}
