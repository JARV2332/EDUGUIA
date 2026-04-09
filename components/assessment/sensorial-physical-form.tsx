"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/language-context";
import { Eye, Ear, Hand } from "lucide-react";
import type { AssessmentData } from "@/app/assessment/page";

interface SensorialPhysicalFormProps {
  data: AssessmentData;
  updateData: (updates: Partial<AssessmentData>) => void;
}

export function SensorialPhysicalForm({ data, updateData }: SensorialPhysicalFormProps) {
  const { t } = useLanguage();

  const visualOptions = [
    { value: "none", label: t("sensorial.normal") },
    { value: "low-vision", label: t("sensorial.mild") },
    { value: "legally-blind", label: t("sensorial.moderate") },
    { value: "blind", label: t("sensorial.severe") },
  ];

  const hearingOptions = [
    { value: "none", label: t("sensorial.normal") },
    { value: "mild", label: t("sensorial.mild") },
    { value: "hard-of-hearing", label: t("sensorial.moderate") },
    { value: "deaf", label: t("sensorial.severe") },
  ];

  const motorOptions = [
    { value: "typical", label: t("sensorial.normal") },
    { value: "fine-motor", label: t("sensorial.mild") },
    { value: "gross-motor", label: t("sensorial.moderate") },
    { value: "both", label: t("sensorial.severe") },
  ];

  const assistiveTechOptions = [
    { id: "screen-reader", label: t("sensorial.screenReader") },
    { id: "magnification", label: t("sensorial.glasses") },
    { id: "hearing-aids", label: t("sensorial.hearingAid") },
    { id: "communication-device", label: t("sensorial.speechDevice") },
    { id: "braille", label: t("sensorial.braille") },
    { id: "wheelchair", label: t("sensorial.wheelchair") },
    { id: "adaptive-keyboard", label: t("sensorial.adaptiveKeyboard") },
  ];

  const updateSensorial = (field: keyof AssessmentData["sensorial"], value: string | string[]) => {
    updateData({
      sensorial: {
        ...data.sensorial,
        [field]: value,
      },
    });
  };

  const toggleAssistiveTech = (techId: string) => {
    const current = data.sensorial.assistiveTech;
    const updated = current.includes(techId)
      ? current.filter((t) => t !== techId)
      : [...current, techId];
    updateSensorial("assistiveTech", updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sensorial.title")}</CardTitle>
        <CardDescription>
          {t("sensorial.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Visual Impairment */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2 text-base font-semibold">
            <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("sensorial.visualAcuity")}
          </legend>
          <p className="text-sm text-muted-foreground">{t("sensorial.visualAcuityDesc")}</p>
          <RadioGroup
            value={data.sensorial.visualImpairment}
            onValueChange={(value) => updateSensorial("visualImpairment", value)}
            aria-label={t("sensorial.visualAcuity")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {visualOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={`visual-${option.value}`} />
                  <Label htmlFor={`visual-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </fieldset>

        {/* Hearing Impairment */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2 text-base font-semibold">
            <Ear className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("sensorial.hearingLevel")}
          </legend>
          <p className="text-sm text-muted-foreground">{t("sensorial.hearingLevelDesc")}</p>
          <RadioGroup
            value={data.sensorial.hearingImpairment}
            onValueChange={(value) => updateSensorial("hearingImpairment", value)}
            aria-label={t("sensorial.hearingLevel")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {hearingOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={`hearing-${option.value}`} />
                  <Label htmlFor={`hearing-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </fieldset>

        {/* Motor Skills */}
        <fieldset className="space-y-4">
          <legend className="flex items-center gap-2 text-base font-semibold">
            <Hand className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("sensorial.motorSkills")}
          </legend>
          <p className="text-sm text-muted-foreground">{t("sensorial.motorSkillsDesc")}</p>
          <RadioGroup
            value={data.sensorial.motorSkills}
            onValueChange={(value) => updateSensorial("motorSkills", value)}
            aria-label={t("sensorial.motorSkills")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {motorOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={`motor-${option.value}`} />
                  <Label htmlFor={`motor-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </fieldset>

        {/* Assistive Technology */}
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold">
            {t("sensorial.assistiveTech")}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {assistiveTechOptions.map((tech) => (
              <div key={tech.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`tech-${tech.id}`}
                  checked={data.sensorial.assistiveTech.includes(tech.id)}
                  onCheckedChange={() => toggleAssistiveTech(tech.id)}
                />
                <Label htmlFor={`tech-${tech.id}`} className="cursor-pointer">
                  {tech.label}
                </Label>
              </div>
            ))}
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
