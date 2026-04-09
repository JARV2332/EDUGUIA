"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Shield,
  VolumeX,
  Eye,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface CrisisProtocolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrisisProtocolDialog({
  open,
  onOpenChange,
}: CrisisProtocolDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { t, language } = useLanguage();

  const crisisSteps = [
    {
      id: 1,
      title: t("crisis.step1Title"),
      icon: Shield,
      description: t("crisis.step1Desc"),
      instructions: language === "es" 
        ? [
            "Mover objetos afilados fuera del alcance",
            "Despejar espacio alrededor del estudiante",
            "Pedir a otros estudiantes que den espacio",
            "Posicionarse para prevenir lesiones sin restriccion fisica",
          ]
        : [
            "Move sharp objects out of reach",
            "Clear space around the student",
            "Ask other students to give space",
            "Position yourself to prevent injury without physical restraint",
          ],
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      id: 2,
      title: t("crisis.step2Title"),
      icon: VolumeX,
      description: t("crisis.step2Desc"),
      instructions: language === "es"
        ? [
            "Atenuar o apagar luces si es posible",
            "Reducir ruido de fondo (apagar musica, cerrar puertas)",
            "Remover o esconder elementos visualmente estimulantes",
            "Ofrecer audifonos con cancelacion de ruido si estan disponibles",
          ]
        : [
            "Dim or turn off overhead lights if possible",
            "Reduce background noise (turn off music, close doors)",
            "Remove or hide visually stimulating items",
            "Offer noise-canceling headphones if available",
          ],
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      id: 3,
      title: t("crisis.step3Title"),
      icon: Eye,
      description: t("crisis.step3Desc"),
      instructions: language === "es"
        ? [
            "Hablar en voz baja y calmada",
            "Usar frases cortas y simples",
            "Evitar hacer preguntas o demandas",
            "Usar senales visuales o gestos en lugar de palabras",
          ]
        : [
            "Speak in a low, calm voice",
            "Use short, simple phrases",
            "Avoid asking questions or making demands",
            "Use visual cues or gestures instead of words",
          ],
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 4,
      title: t("crisis.step4Title"),
      icon: Clock,
      description: t("crisis.step4Desc"),
      instructions: language === "es"
        ? [
            "Permanecer cerca pero dar espacio fisico",
            "Esperar pacientemente - esto puede tomar 10-20 minutos",
            "No intentar razonar o discutir durante la crisis",
            "Ofrecer objetos de confort si el estudiante los busca",
          ]
        : [
            "Stay nearby but give physical space",
            "Wait patiently - this may take 10-20 minutes",
            "Don't try to reason or discuss during the crisis",
            "Offer comfort items if the student reaches for them",
          ],
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      id: 5,
      title: t("crisis.step5Title"),
      icon: Heart,
      description: t("crisis.step5Desc"),
      instructions: language === "es"
        ? [
            "Ofrecer agua cuando este listo",
            "Permitir tiempo de descanso antes de volver a actividades",
            "Evitar discutir el incidente inmediatamente",
            "Documentar el incidente para identificacion de patrones",
          ]
        : [
            "Offer water when they're ready",
            "Allow rest time before returning to activities",
            "Avoid discussing the incident immediately",
            "Document the incident for pattern identification",
          ],
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const step = crisisSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / crisisSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < crisisSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" aria-hidden="true" />
            {t("crisis.title")}
          </DialogTitle>
          <DialogDescription>
            {t("crisis.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">
                {t("crisis.step")} {currentStep + 1} {t("common.of")} {crisisSteps.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div
            className={cn(
              "rounded-lg p-6",
              step.bgColor
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-full bg-background p-3", step.color)}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>

            <ul className="mt-6 space-y-3" role="list">
              {step.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className={cn("mt-0.5 h-5 w-5 shrink-0", step.color)} aria-hidden="true" />
                  <span className="text-sm leading-relaxed">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label={t("crisis.title")}>
            {crisisSteps.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-6 bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-border"
                )}
                aria-label={`${t("crisis.step")} ${index + 1}: ${s.title}`}
                aria-selected={index === currentStep}
                role="tab"
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("assessment.previous")}
          </Button>
          {currentStep === crisisSteps.length - 1 ? (
            <Button onClick={handleClose}>
              {t("crisis.allCompleted")}
              <CheckCircle2 className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {t("assessment.next")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
