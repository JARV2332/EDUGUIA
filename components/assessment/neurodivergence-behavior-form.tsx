"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/language-context";
import { Brain, Focus, Zap, Users, AlertCircle, Volume2 } from "lucide-react";
import type { AssessmentData } from "@/app/assessment/page";

interface NeurodivergenceBehaviorFormProps {
  data: AssessmentData;
  updateData: (updates: Partial<AssessmentData>) => void;
}

export function NeurodivergenceBehaviorForm({ data, updateData }: NeurodivergenceBehaviorFormProps) {
  const { t } = useLanguage();

  const indicators = [
    {
      id: "attention",
      label: t("neuro.attention"),
      description: t("neuro.attentionDesc"),
      icon: Focus,
      dsmCategory: "ADHD - Inattentive",
    },
    {
      id: "hyperactivity",
      label: t("neuro.hyperactivity"),
      description: t("neuro.hyperactivityDesc"),
      icon: Zap,
      dsmCategory: "ADHD - Hyperactive-Impulsive",
    },
    {
      id: "socialInteraction",
      label: t("neuro.social"),
      description: t("neuro.socialDesc"),
      icon: Users,
      dsmCategory: "ASD - Social communication",
    },
    {
      id: "anxiety",
      label: t("neuro.anxiety"),
      description: t("neuro.anxietyDesc"),
      icon: AlertCircle,
      dsmCategory: t("neuro.anxietyDisorder"),
    },
    {
      id: "sensoryOverload",
      label: t("neuro.sensory"),
      description: t("neuro.sensoryDesc"),
      icon: Volume2,
      dsmCategory: "Sensory Processing",
    },
  ];

  const updateNeurodivergence = (field: keyof AssessmentData["neurodivergence"], value: boolean | string) => {
    updateData({
      neurodivergence: {
        ...data.neurodivergence,
        [field]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
          {t("neuro.title")}
        </CardTitle>
        <CardDescription>
          {t("neuro.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <fieldset>
          <legend className="sr-only">{t("neuro.title")}</legend>
          <div className="space-y-4">
            {indicators.map((indicator) => {
              const isChecked = data.neurodivergence[indicator.id as keyof typeof data.neurodivergence] as boolean;
              return (
                <div
                  key={indicator.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    isChecked ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id={indicator.id}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        updateNeurodivergence(indicator.id as keyof AssessmentData["neurodivergence"], checked === true)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <indicator.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                        <Label htmlFor={indicator.id} className="cursor-pointer text-base font-semibold">
                          {indicator.label}
                        </Label>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {indicator.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground/70">
                        Reference: {indicator.dsmCategory}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="additional-notes">{t("sensorial.additionalNotes")}</Label>
          <Textarea
            id="additional-notes"
            placeholder={t("sensorial.additionalNotesPlaceholder")}
            value={data.neurodivergence.additionalNotes}
            onChange={(e) => updateNeurodivergence("additionalNotes", e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
