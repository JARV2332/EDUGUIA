"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface AssessmentStepperProps {
  steps: Step[];
  currentStep: number;
}

export function AssessmentStepper({ steps, currentStep }: AssessmentStepperProps) {
  const { language } = useLanguage();

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between gap-1 sm:gap-0">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(stepIdx !== steps.length - 1 ? "flex-1" : "", "relative min-w-0")}
          >
            {step.id < currentStep ? (
              <div className="group flex w-full items-center">
                <span className="flex items-center">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary sm:h-10 sm:w-10"
                    aria-label={`Step ${step.id} completed`}
                  >
                    <Check className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" aria-hidden="true" />
                  </span>
                  <span className="ml-4 hidden text-sm font-medium text-foreground lg:block">
                    {step.name}
                  </span>
                </span>
                {stepIdx !== steps.length - 1 && (
                  <div className="ml-4 hidden h-0.5 flex-1 bg-primary lg:block" aria-hidden="true" />
                )}
              </div>
            ) : step.id === currentStep ? (
              <div className="flex w-full items-center" aria-current="step">
                <span className="flex items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background sm:h-10 sm:w-10">
                    <span className="text-xs font-semibold text-primary sm:text-sm">{step.id}</span>
                  </span>
                  <span className="ml-4 hidden lg:flex lg:flex-col">
                    <span className="text-sm font-semibold text-primary">{step.name}</span>
                    <span className="text-xs text-muted-foreground">{step.description}</span>
                  </span>
                </span>
                {stepIdx !== steps.length - 1 && (
                  <div className="ml-4 hidden h-0.5 flex-1 bg-border lg:block" aria-hidden="true" />
                )}
              </div>
            ) : (
              <div className="group flex w-full items-center">
                <span className="flex items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background sm:h-10 sm:w-10">
                    <span className="text-xs text-muted-foreground sm:text-sm">{step.id}</span>
                  </span>
                  <span className="ml-4 hidden text-sm text-muted-foreground lg:block">
                    {step.name}
                  </span>
                </span>
                {stepIdx !== steps.length - 1 && (
                  <div className="ml-4 hidden h-0.5 flex-1 bg-border lg:block" aria-hidden="true" />
                )}
              </div>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-3 lg:hidden">
        <p className="text-sm font-medium text-primary">
          {language === "es" ? "Paso" : "Step"} {currentStep} {language === "es" ? "de" : "of"} {steps.length}
        </p>
        <p className="text-sm text-muted-foreground">{steps[currentStep - 1]?.description}</p>
      </div>
    </nav>
  );
}
