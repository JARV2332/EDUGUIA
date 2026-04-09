"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              stepIdx !== steps.length - 1 ? "flex-1" : "",
              "relative"
            )}
          >
            {step.id < currentStep ? (
              // Completed step
              <div className="group flex w-full items-center">
                <span className="flex items-center">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary"
                    aria-label={`Step ${step.id} completed`}
                  >
                    <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
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
              // Current step
              <div className="flex w-full items-center" aria-current="step">
                <span className="flex items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <span className="text-sm font-semibold text-primary">{step.id}</span>
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
              // Upcoming step
              <div className="group flex w-full items-center">
                <span className="flex items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background">
                    <span className="text-sm text-muted-foreground">{step.id}</span>
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

      {/* Mobile: Show current step info */}
      <div className="mt-4 lg:hidden">
        <p className="text-sm font-medium text-primary">
          Step {currentStep} of {steps.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
    </nav>
  );
}
