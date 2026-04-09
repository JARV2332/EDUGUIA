"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, HeartPulse } from "lucide-react";

interface SensoryCrisisButtonProps {
  onClick: () => void;
}

export function SensoryCrisisButton({ onClick }: SensoryCrisisButtonProps) {
  const { t, language } = useLanguage();

  return (
    <Card className="border-2 border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="rounded-full bg-destructive/10 p-3">
            <HeartPulse className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-destructive">
              {language === "es" ? "Soporte de Crisis Sensorial" : "Sensory Crisis Support"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "es" 
                ? "Protocolos inmediatos para crisis o ataques de ansiedad" 
                : "Immediate protocols for meltdowns or anxiety attacks"}
            </p>
          </div>
        </div>
        <Button
          size="lg"
          variant="destructive"
          onClick={onClick}
          className="min-w-[200px] text-lg font-bold shadow-lg transition-transform hover:scale-105"
          aria-label={t("crisis.button")}
        >
          <AlertTriangle className="mr-2 h-5 w-5" aria-hidden="true" />
          {t("crisis.button")}
        </Button>
      </CardContent>
    </Card>
  );
}
