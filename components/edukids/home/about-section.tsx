export function AboutSection() {
  return (
    <section id="que-es-edukids" className="scroll-mt-28 bg-brand-light">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cyan">La academia</p>
        <div className="mt-3 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-darkblue sm:text-4xl">
            ¿Qué es EDUKIDS y el respaldo de I.T.E.?
          </h2>
          <p className="text-base leading-relaxed text-brand-darkblue/75">
            EDUKIDS es la academia tecnopedagógica que convierte curiosidad en habilidad creadora. Niños, jóvenes,
            docentes e instituciones diseñan, programan y publican lo que imaginan.
          </p>
        </div>

        <article className="ek-glow mt-10 bg-brand-darkblue p-7 text-white sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-yellow">Bloque institucional</p>
          <h3 className="mt-3 text-2xl font-extrabold">I.T.E. · Instituto de Tecnología & Educación</h3>
          <p className="mt-3 max-w-3xl leading-relaxed text-white/80">
            I.T.E. es el respaldo pedagógico de EDUKIDS para colegios y capacitaciones. Acompaña mallas curriculares,
            laboratorios STEAM y formación docente para que la metodología se sostenga dentro del centro educativo, no
            solo en un taller aislado.
          </p>
        </article>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="ek-glow bg-white p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-cyan">Misión</p>
            <h3 className="mt-3 text-2xl font-bold text-brand-darkblue">Crear, no solo consumir</h3>
            <p className="mt-3 leading-relaxed text-brand-darkblue/75">
              Acompañar a cada persona —desde los 7 hasta los 99 años— para que convierta curiosidad en proyectos de
              ciencia, tecnología, ingeniería, naturaleza, arte y matemáticas.
            </p>
          </article>
          <article className="ek-glow bg-white p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-yellow">Visión</p>
            <h3 className="mt-3 text-2xl font-bold text-brand-darkblue">Guatemala que construye</h3>
            <p className="mt-3 leading-relaxed text-brand-darkblue/75">
              Una red de aulas, laboratorios y equipos donde colegios, familias y empresas diseñan tecnología con
              propósito, con el respaldo institucional de I.T.E.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
