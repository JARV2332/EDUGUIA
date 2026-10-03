import type { LandingContacto } from "@/lib/landing/get-contacto";
import { CONTACT_EMAIL, edukidsWhatsAppUrl, FACEBOOK_URL, INSTAGRAM_URL, ITE_BADGE, PLATFORM_LINKS } from "@/lib/edukids/content";

const pill =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow";

export function SiteFooter({ contacto }: { contacto: LandingContacto }) {
  const whatsapp = edukidsWhatsAppUrl(contacto.whatsapp_url);
  const facebook = contacto.facebook_url || FACEBOOK_URL;
  const instagram = contacto.instagram_url || INSTAGRAM_URL;

  return (
    <footer className="bg-brand-darkblue text-white" role="contentinfo">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <img src="/assets/logo-edukids.png" alt="EDUKIDS" width={140} height={64} className="h-16 w-auto object-contain" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">{ITE_BADGE}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{contacto.footer_text}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={PLATFORM_LINKS.isabel} target="_blank" rel="noopener noreferrer" className={`${pill} ek-btn border border-white/25 text-white`}>
              ISABEL
            </a>
            <a href={PLATFORM_LINKS.eduguia} className={`${pill} ek-btn bg-brand-cyan text-brand-darkblue`}>
              EDUGUIA
            </a>
            <a href={edukidsWhatsAppUrl(contacto.whatsapp_url)} target="_blank" rel="noopener noreferrer" className={`${pill} ek-btn bg-brand-yellow text-brand-darkblue`}>
              Escríbenos
            </a>
            <a href={PLATFORM_LINKS.ite} className={`${pill} ek-btn border border-white/25 text-white`}>
              I.T.E.
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-yellow">Contacto</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>
              <a className="hover:text-brand-cyan" href={whatsapp} target="_blank" rel="noopener noreferrer">
                WhatsApp · 5988 6915
              </a>
            </li>
            <li>
              <a className="hover:text-brand-cyan" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a className="hover:text-brand-cyan" href={facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a className="hover:text-brand-cyan" href={instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a className="hover:text-brand-cyan" href={PLATFORM_LINKS.contacto}>
                Formulario de contacto
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-yellow">Guatemala</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Programas presenciales y acompañamiento a colegios en Guatemala.
          </p>
          <iframe
            title="Mapa de Guatemala"
            className="mt-4 h-40 w-full rounded-2xl border border-white/10"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-92.3%2C13.6%2C-88.2%2C17.8&amp;layer=mapnik"
          />
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/55 sm:px-6">
          {contacto.copyright_text || "© EduKids GT. Todos los derechos reservados."}
        </p>
      </div>
    </footer>
  );
}
