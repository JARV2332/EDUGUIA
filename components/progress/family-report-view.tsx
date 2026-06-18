import type { ReportSnapshot } from "@/lib/student-store";

const SUBJECT_KEYS = [
  { key: "numeracy" as const, es: "Área numérica", en: "Numeracy" },
  { key: "language" as const, es: "Lenguaje", en: "Language" },
  { key: "foreignLanguage" as const, es: "Nuevo idioma", en: "New language" },
  { key: "arts" as const, es: "Artes", en: "Arts" },
  { key: "ict" as const, es: "TIC", en: "ICT" },
  { key: "other" as const, es: "Otros apoyos", en: "Other supports" },
];

interface FamilyReportViewProps {
  studentName: string;
  snapshot: ReportSnapshot;
  locale?: "es" | "en";
}

export function FamilyReportView({ studentName, snapshot, locale = "es" }: FamilyReportViewProps) {
  const isEs = locale === "es";

  return (
    <div className="space-y-8">
      <header className="rounded-xl bg-gradient-to-br from-[#1a4d7a] to-[#2d8f8f] p-6 text-white shadow-lg">
        <p className="text-sm font-medium uppercase tracking-wide opacity-90">
          {isEs ? "Informe para la familia" : "Family report"}
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{studentName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-95">
          {isEs
            ? "Este resumen fue preparado por el equipo docente de su centro educativo con apoyo de EDUGUIA. No es un diagnóstico clínico; orienta apoyos en casa y en la escuela."
            : "This summary was prepared by your school team with EDUGUIA support. It is not a clinical diagnosis; it guides supports at home and school."}
        </p>
      </header>

      {snapshot.familySummaryKaqchikel?.length > 0 && (
        <section className="rounded-xl border-2 border-amber-400/60 bg-amber-50 p-6 dark:bg-amber-950/20">
          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">
            {isEs ? "Rutzijik pa ri ajtïk" : "Summary for the family (Kaqchikel)"}
          </h2>
          <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/80">
            {isEs
              ? "Consejos en lengua materna para acompañar en casa"
              : "Guidance in the home language to support learning"}
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed">
            {snapshot.familySummaryKaqchikel.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          {isEs ? "Recomendaciones del informe" : "Report recommendations"}
        </h2>
        {snapshot.report.map((section) => (
          <article key={section.id} className="rounded-lg border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-primary">{section.title}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {section.content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {SUBJECT_KEYS.some(({ key }) => snapshot.subjectStrategies[key]?.length) && (
        <section className="rounded-lg border bg-muted/30 p-5">
          <h2 className="text-lg font-semibold">
            {isEs ? "Apoyos por área de aprendizaje" : "Learning area supports"}
          </h2>
          <div className="mt-4 space-y-4">
            {SUBJECT_KEYS.map(({ key, es, en }) => {
              const items = snapshot.subjectStrategies[key];
              if (!items?.length) return null;
              return (
                <div key={key}>
                  <h3 className="font-medium text-sm">{isEs ? es : en}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <footer className="border-t pt-6 text-center text-xs text-muted-foreground">
        <p>EduKids GT · EDUGUIA</p>
        <p className="mt-1">
          {isEs
            ? "Si tiene dudas, contacte al docente de su hijo o hija."
            : "If you have questions, contact your child's teacher."}
        </p>
      </footer>
    </div>
  );
}
