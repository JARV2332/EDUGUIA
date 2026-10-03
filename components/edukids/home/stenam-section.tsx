"use client";

import { FlipCard } from "@/components/edukids/flip-card";
import { STENAM_PILLARS } from "@/lib/edukids/content";

const accents = [
  "bg-brand-cyan",
  "bg-brand-yellow",
  "bg-brand-coral",
  "bg-brand-orange",
  "bg-brand-cyan",
  "bg-brand-yellow",
];

export function StenamSection() {
  return (
    <section id="stenam" className="scroll-mt-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-coral">Metodología</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-brand-darkblue sm:text-4xl">
          STENAM, seis pilares para construir
        </h2>
        <p className="mt-4 max-w-2xl text-brand-darkblue/70">
          Pasa el cursor o toca una tarjeta para ver las herramientas y los proyectos de cada letra.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STENAM_PILLARS.map((pillar, index) => (
            <FlipCard
              key={pillar.letter}
              label={`${pillar.letter}, ${pillar.name}`}
              front={
                <>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-extrabold text-brand-darkblue ${accents[index]}`}>
                    {pillar.letter}
                  </span>
                  <span className="mt-5 block text-xl font-bold text-brand-darkblue">{pillar.name}</span>
                  <span className="mt-1 block text-sm font-medium text-brand-darkblue/55">{pillar.title}</span>
                  <span className="mt-3 block text-sm leading-relaxed text-brand-darkblue/75">{pillar.summary}</span>
                </>
              }
              back={
                <>
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-yellow">
                    {pillar.letter} · {pillar.title}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-white/85">{pillar.detail}</span>
                  <span className="mt-4 block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-cyan">Herramientas</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {pillar.tools.map((tool) => (
                      <span key={tool} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                        {tool}
                      </span>
                    ))}
                  </span>
                  <span className="mt-4 block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-orange">Proyectos</span>
                  <span className="mt-1 block text-sm text-white/80">{pillar.projects}</span>
                </>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
