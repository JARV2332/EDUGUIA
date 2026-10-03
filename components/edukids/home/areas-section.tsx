import { Bot, Box, Code2, FlaskConical, Zap } from "lucide-react";
import { FlipCard } from "@/components/edukids/flip-card";
import { LEARNING_AREAS } from "@/lib/edukids/content";

const icons = {
  code: Code2,
  zap: Zap,
  maker: Box,
  bot: Bot,
  science: FlaskConical,
};

export function AreasSection() {
  return (
    <section id="programas" className="scroll-mt-28 bg-brand-light">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cyan">Programas</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-brand-darkblue sm:text-4xl">
          Nuestras 5 áreas de aprendizaje
        </h2>
        <p className="mt-4 max-w-2xl text-brand-darkblue/70">
          Cada área gira para mostrar con qué se construye y qué sale del taller.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {LEARNING_AREAS.map((area, index) => {
            const Icon = icons[area.icon];
            const span = index < 2 ? "xl:col-span-3" : "xl:col-span-2";
            return (
              <div key={area.id} className={span}>
                <FlipCard
                  label={area.title}
                  front={
                    <>
                      <span className="flex items-start justify-between gap-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-darkblue text-brand-cyan">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span className="rounded-full bg-brand-coral/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-coral">
                          0{index + 1}
                        </span>
                      </span>
                      <span className="mt-5 block text-xl font-bold text-brand-darkblue">{area.title}</span>
                      <span className="mt-1 block text-sm font-medium text-brand-darkblue/60">{area.subtitle}</span>
                    </>
                  }
                  back={
                    <>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-yellow">{area.title}</span>
                      <span className="mt-3 block text-sm leading-relaxed text-white/85">{area.projects}</span>
                      <span className="mt-4 block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-cyan">Herramientas</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {area.tools.map((tool) => (
                          <span key={tool} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                            {tool}
                          </span>
                        ))}
                      </span>
                    </>
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
