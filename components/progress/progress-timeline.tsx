"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ClipboardList, Eye, Trophy, Lightbulb } from "lucide-react";
import type { TimelineEntry } from "@/app/progress/page";

interface ProgressTimelineProps {
  entries: TimelineEntry[];
  studentName: string;
}

const typeConfig = {
  assessment: {
    icon: ClipboardList,
    color: "bg-primary text-primary-foreground",
    label: "Assessment",
  },
  observation: {
    icon: Eye,
    color: "bg-secondary text-secondary-foreground",
    label: "Observation",
  },
  milestone: {
    icon: Trophy,
    color: "bg-success text-success-foreground",
    label: "Milestone",
  },
  intervention: {
    icon: Lightbulb,
    color: "bg-accent text-accent-foreground",
    label: "Intervention",
  },
};

export function ProgressTimeline({ entries, studentName }: ProgressTimelineProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-semibold">No Timeline Entries</h3>
          <p className="text-muted-foreground">
            Start adding observations and milestones for {studentName}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Development Timeline</CardTitle>
        <CardDescription>
          Chronological view of {studentName}&apos;s progress and interventions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-4 top-0 h-full w-0.5 bg-border"
            aria-hidden="true"
          />

          <ul className="space-y-6" role="list" aria-label="Progress timeline">
            {entries.map((entry, index) => {
              const config = typeConfig[entry.type];
              const Icon = config.icon;

              return (
                <li key={entry.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      config.color
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{entry.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        <time dateTime={entry.date}>
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      </span>
                      <span>by {entry.author}</span>
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
