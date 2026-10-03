"use client";

import { useState } from "react";
import { AUDIENCES, edukidsWhatsAppUrl } from "@/lib/edukids/content";

export function AudiencesSection() {
  const [active, setActive] = useState(AUDIENCES[0].id);
  const current = AUDIENCES.find((item) => item.id === active) ?? AUDIENCES[0];

  return (
    <section id="para-quien" className="scroll-mt-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange">Públicos</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-darkblue sm:text-4xl">
          ¿Para quién trabajamos?
        </h2>

        <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="Públicos de EDUKIDS">
          {AUDIENCES.map((item) => {
            const selected = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`panel-${item.id}`}
                onClick={() => setActive(item.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan ${
                  selected
                    ? "border-brand-darkblue bg-brand-darkblue text-white"
                    : "border-brand-darkblue/10 bg-brand-light text-brand-darkblue hover:border-brand-cyan/40"
                }`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="mt-2 block font-bold">{item.title}</span>
                <span className={`mt-1 block text-xs font-semibold ${selected ? "text-brand-yellow" : "text-brand-cyan"}`}>
                  {item.range}
                </span>
              </button>
            );
          })}
        </div>

        <div
          key={current.id}
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}
          className="ek-rise mt-4 rounded-[2rem] bg-brand-light px-6 py-8 sm:px-10"
        >
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-coral">{current.range}</p>
          <h3 className="mt-2 text-2xl font-extrabold text-brand-darkblue sm:text-3xl">
            <span className="mr-2" aria-hidden="true">
              {current.emoji}
            </span>
            {current.title}
          </h3>
          <p className="mt-3 max-w-2xl text-lg text-brand-darkblue/80">{current.lead}</p>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {current.points.map((point) => (
              <li key={point} className="rounded-2xl bg-white px-4 py-4 text-sm leading-relaxed text-brand-darkblue/80 shadow-sm">
                {point}
              </li>
            ))}
          </ul>
          <a
            href={edukidsWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="ek-btn mt-6 inline-flex rounded-full bg-brand-yellow px-5 py-2.5 text-sm font-bold text-brand-darkblue"
          >
            Consultar este programa
          </a>
        </div>
      </div>
    </section>
  );
}
