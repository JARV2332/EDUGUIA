import { FACEBOOK_URL } from "@/lib/edukids/content";

export function CommunitySection({ facebookUrl }: { facebookUrl?: string | null }) {
  const href = facebookUrl || FACEBOOK_URL;

  return (
    <section id="comunidad" className="bg-brand-light">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_16px_50px_rgba(14,27,56,0.06)] md:grid md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cyan">Comunidad activa</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-darkblue sm:text-4xl">
              Lo que pasa en el aula, también pasa en Facebook
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-brand-darkblue/75">
              Talleres, entregas y noticias del programa se publican en la página oficial de EDUKIDS Guatemala.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-brand-darkblue px-6 py-3 text-sm font-bold text-white hover:bg-brand-cyan hover:text-brand-darkblue"
            >
              Ir a Facebook
            </a>
          </div>
          <div className="relative min-h-48 bg-brand-darkblue">
            <div className="absolute inset-0 opacity-80" aria-hidden="true">
              <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-brand-cyan/40 blur-2xl" />
              <div className="absolute bottom-6 right-8 h-28 w-28 rounded-full bg-brand-yellow/30 blur-2xl" />
            </div>
            <p className="relative flex h-full items-end p-8 text-2xl font-extrabold text-white">@edukidsguatemala</p>
          </div>
        </div>
      </div>
    </section>
  );
}
