"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { stripMarkdownForPdf } from "@/lib/progress-report-pdf";
import { ClipboardList, Eye, Trophy, Lightbulb } from "lucide-react";
import type { TimelineEntry } from "@/lib/student-store";

interface ProgressTimelineProps {
  entries: TimelineEntry[];
  studentName: string;
}

export function ProgressTimeline({ entries, studentName }: ProgressTimelineProps) {
  const { language } = useLanguage();

  const typeConfig = {
    assessment: {
      icon: ClipboardList,
      color: "bg-primary text-primary-foreground",
      label: language === "es" ? "Evaluación" : "Assessment",
    },
    observation: {
      icon: Eye,
      color: "bg-secondary text-secondary-foreground",
      label: language === "es" ? "Observación" : "Observation",
    },
    milestone: {
      icon: Trophy,
      color: "bg-success text-success-foreground",
      label: language === "es" ? "Hito" : "Milestone",
    },
    intervention: {
      icon: Lightbulb,
      color: "bg-accent text-accent-foreground",
      label: language === "es" ? "Seguimiento IA" : "AI follow-up",
    },
  };

  const teacherLabel = language === "es" ? "Docente" : "Teacher";
  const aiLabel = "EduGuIA";

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-semibold">
            {language === "es" ? "Sin entradas" : "No entries"}
          </h3>
          <p className="text-muted-foreground">
            {language === "es"
              ? `Agrega observaciones o seguimiento con IA para ${studentName}`
              : `Add observations or AI follow-up for ${studentName}`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === "es" ? "Línea de tiempo" : "Timeline"}</CardTitle>
        <CardDescription>
          {language === "es"
            ? `Historial de ${studentName} (incluye respuestas de EduGuIA en seguimiento)`
            : `History for ${studentName} (includes EduGuIA replies in follow-up)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border" aria-hidden="true" />

          <ul className="space-y-6" role="list" aria-label="Progress timeline">
            {entries.map((entry) => {
              const config = typeConfig[entry.type];
              const Icon = config.icon;
              const showAiBlock =
                entry.type === "intervention" && entry.aiResponse?.trim();

              return (
                <li key={entry.id} className="relative flex gap-4">
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      config.color
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{entry.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>

                    {showAiBlock ? (
                      <div className="mt-3 space-y-2">
                        {entry.description?.trim() && (
                          <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {teacherLabel}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                              {entry.description}
                            </p>
                          </div>
                        )}
                        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                            {aiLabel}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                            {stripMarkdownForPdf(entry.aiResponse!)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      entry.description?.trim() && (
                        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                          {entry.description}
                        </p>
                      )
                    )}

                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <time dateTime={entry.date}>
                        {new Date(entry.date).toLocaleDateString(
                          language === "es" ? "es-GT" : "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </time>
                      <span>
                        {language === "es" ? "por" : "by"} {entry.author}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
