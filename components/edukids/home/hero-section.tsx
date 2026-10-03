import Link from "next/link";
import { CircuitBackdrop } from "@/components/edukids/circuit-backdrop";
import { edukidsWhatsAppUrl } from "@/lib/edukids/content";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-darkblue text-white">
      <CircuitBackdrop />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-yellow">
            STENAM · 7 a 99 años
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            El futuro no se memoriza, se construye.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Educación STENAM, Robótica, Programación e IA para mentes de 7 a 99 años. Un programa de I.T.E.
            (Instituto de Tecnología & Educación).
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#programas"
              className="ek-btn inline-flex items-center justify-center rounded-full bg-brand-cyan px-6 py-3 text-sm font-bold text-brand-darkblue shadow-[0_10px_30px_rgba(0,188,235,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Descubrir Programas
            </a>
            <a
              href={edukidsWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="ek-btn inline-flex items-center justify-center rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-darkblue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-orange">Seis pilares</p>
            <p className="mt-2 text-2xl font-bold">STENAM</p>
            <ul className="mt-5 grid grid-cols-3 gap-2">
              {[
                ["S", "Ciencia"],
                ["T", "Tecnología"],
                ["E", "Ingeniería"],
                ["N", "Naturaleza"],
                ["A", "Arte"],
                ["M", "Matemáticas"],
              ].map(([letter, label]) => (
                <li key={letter} className="rounded-2xl border border-white/10 bg-brand-darkblue/60 px-2 py-3 text-center">
                  <span className="block text-xl font-extrabold text-brand-cyan">{letter}</span>
                  <span className="mt-1 block text-[11px] text-white/70">{label}</span>
                </li>
              ))}
            </ul>
            <Link
              href="#stenam"
              className="mt-5 inline-flex text-sm font-semibold text-brand-yellow hover:underline"
            >
              Ver la metodología
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
