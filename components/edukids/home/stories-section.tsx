"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { STORY_FILTERS, type StoryCategory, type StoryItem } from "@/lib/edukids/content";

export function StoriesSection({ items }: { items: StoryItem[] }) {
  const [filter, setFilter] = useState<StoryCategory | "todos">("todos");
  const [active, setActive] = useState<StoryItem | null>(null);

  const visible = useMemo(
    () => (filter === "todos" ? items : items.filter((item) => item.category === filter)),
    [filter, items],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section id="historias" className="scroll-mt-28 bg-brand-darkblue text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">Impacto</p>
        <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Galería de noticias, logros y premios
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
          Estudiantes en competencia, reconocimientos y proyectos del archivo EDUKIDS. Abre una foto para ver el logro.
        </p>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="Filtrar galería">
          {STORY_FILTERS.map((item) => {
            const selected = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item.id)}
                className={`ek-btn shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                  selected ? "bg-brand-cyan text-brand-darkblue" : "bg-white/10 text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className="ek-btn overflow-hidden rounded-3xl bg-white text-left text-brand-darkblue"
            >
              <img src={item.image} alt={item.imageAlt} className="h-48 w-full object-cover" />
              <span className="block p-5">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-coral">
                  {STORY_FILTERS.find((filterItem) => filterItem.id === item.category)?.label}
                </span>
                <span className="mt-2 block text-lg font-bold">{item.title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-brand-darkblue/70">{item.text}</span>
              </span>
            </button>
          ))}
        </div>
        {visible.length === 0 && (
          <p className="mt-6 rounded-3xl border border-white/15 px-6 py-10 text-sm text-white/70">
            Todavía no hay piezas en este filtro.
          </p>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-darkblue/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-lightbox-title"
          onClick={() => setActive(null)}
        >
          <div
            className="ek-rise max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white text-brand-darkblue shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={active.image} alt={active.imageAlt} className="max-h-[55vh] w-full object-cover" />
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-coral">
                {STORY_FILTERS.find((filterItem) => filterItem.id === active.category)?.label}
              </p>
              <h3 id="story-lightbox-title" className="mt-2 text-2xl font-extrabold">
                {active.title}
              </h3>
              <p className="mt-3 leading-relaxed text-brand-darkblue/75">{active.text}</p>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="ek-btn mt-5 inline-flex items-center gap-2 rounded-full bg-brand-darkblue px-4 py-2 text-sm font-bold text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
