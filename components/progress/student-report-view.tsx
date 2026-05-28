"use client";

import { useLanguage } from "@/contexts/language-context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportSnapshot } from "@/lib/student-store";

const SUBJECT_KEYS = [
  { key: "numeracy" as const, es: "Área numérica", en: "Numeracy" },
  { key: "language" as const, es: "Lenguaje", en: "Language" },
  { key: "foreignLanguage" as const, es: "Nuevo idioma", en: "New language" },
  { key: "arts" as const, es: "Artes", en: "Arts" },
  { key: "ict" as const, es: "TIC", en: "ICT" },
  { key: "other" as const, es: "Otros apoyos", en: "Other supports" },
];

interface StudentReportViewProps {
  studentName: string;
  snapshot?: ReportSnapshot;
}

export function StudentReportView({ studentName, snapshot }: StudentReportViewProps) {
  const { t, language } = useLanguage();

  if (!snapshot?.report?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("progress.reportTab")}</CardTitle>
          <CardDescription>{t("progress.noReport")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("progress.noReportHint")}</p>
        </CardContent>
      </Card>
    );
  }

  const priorityLabel = (p: "high" | "medium" | "low") => {
    if (p === "high") return t("results.high");
    if (p === "medium") return t("results.medium");
    return t("results.low");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">{studentName}</h3>
        <p className="text-sm text-muted-foreground">{t("progress.reportSaved")}</p>
      </div>

      <Accordion type="multiple" className="w-full space-y-2">
        {snapshot.report.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-wrap items-center gap-2 text-left">
                <span className="font-medium">{section.title}</span>
                <Badge variant={section.priority === "high" ? "destructive" : "secondary"}>
                  {priorityLabel(section.priority)}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {section.content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {SUBJECT_KEYS.some(({ key }) => snapshot.subjectStrategies[key]?.length) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {language === "es" ? "Estrategias por materia" : "Subject strategies"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBJECT_KEYS.map(({ key, es, en }) => {
              const items = snapshot.subjectStrategies[key];
              if (!items?.length) return null;
              return (
                <div key={key}>
                  <p className="mb-2 font-medium text-sm">{language === "es" ? es : en}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {snapshot.familySummaryKaqchikel?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("progress.familyKaqchikel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {snapshot.familySummaryKaqchikel.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
