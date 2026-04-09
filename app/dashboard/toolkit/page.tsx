"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { SensoryCrisisButton } from "@/components/toolkit/sensory-crisis-button";
import { ImmersiveReader } from "@/components/toolkit/immersive-reader";
import { CrisisProtocolDialog } from "@/components/toolkit/crisis-protocol-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BookOpen,
  Heart,
  Shield,
  Phone,
  Clock,
} from "lucide-react";

export default function ToolkitPage() {
  const [crisisDialogOpen, setCrisisDialogOpen] = useState(false);
  const { t, language } = useLanguage();

  const quickResources = [
    {
      title: language === "es" ? "Ejercicio de Respiracion Profunda" : "Deep Breathing Exercise",
      description: language === "es" ? "Tecnica de respiracion 4-7-8 para calmar" : "4-7-8 breathing technique for calming",
      icon: Heart,
    },
    {
      title: language === "es" ? "Protocolo de Espacio Tranquilo" : "Quiet Space Protocol",
      description: language === "es" ? "Pasos para crear un ambiente calmado" : "Steps to create a calm environment",
      icon: Shield,
    },
    {
      title: language === "es" ? "Contactos de Emergencia" : "Emergency Contacts",
      description: language === "es" ? "Consejero escolar y personal de apoyo" : "School counselor and support staff",
      icon: Phone,
    },
    {
      title: language === "es" ? "Guias de Tiempo Fuera" : "Time-Out Guidelines",
      description: language === "es" ? "Procedimientos de descanso estructurado" : "Structured break procedures",
      icon: Clock,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("toolkit.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("toolkit.subtitle")}
          </p>
        </header>

        {/* Sensory Crisis Button - Always Visible */}
        <section aria-labelledby="crisis-heading" className="mb-8">
          <h2 id="crisis-heading" className="sr-only">
            {t("toolkit.crisisProtocols")}
          </h2>
          <SensoryCrisisButton onClick={() => setCrisisDialogOpen(true)} />
        </section>

        <Tabs defaultValue="emergency" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {t("toolkit.crisisProtocols")}
            </TabsTrigger>
            <TabsTrigger value="reader" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t("toolkit.immersiveReader")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emergency" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {quickResources.map((resource) => (
                <Card key={resource.title} className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <resource.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" aria-hidden="true" />
                  {language === "es" ? "Referencia Rapida de Estrategias de Calma" : "Calming Strategies Quick Reference"}
                </CardTitle>
                <CardDescription>
                  {language === "es" 
                    ? "Tecnicas basadas en evidencia para desescalada y regulacion emocional" 
                    : "Evidence-based techniques for de-escalation and emotional regulation"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-semibold">
                      {language === "es" ? "Para Ansiedad/Panico" : "For Anxiety/Panic"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {language === "es" 
                          ? "Tecnica de anclaje: 5 cosas que ves, 4 que oyes, 3 que tocas"
                          : "Grounding technique: 5 things you see, 4 you hear, 3 you touch"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {language === "es"
                          ? "Respiracion cuadrada: 4 tiempos inhalar, sostener, exhalar, sostener"
                          : "Box breathing: 4 counts in, hold, out, hold"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {language === "es"
                          ? "Relajacion muscular progresiva"
                          : "Progressive muscle relaxation"}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold">
                      {language === "es" ? "Para Sobrecarga Sensorial" : "For Sensory Overload"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                        {language === "es"
                          ? "Mover a un ambiente de baja estimulacion"
                          : "Move to low-stimulation environment"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                        {language === "es"
                          ? "Ofrecer audifonos con cancelacion de ruido"
                          : "Offer noise-canceling headphones"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                        {language === "es"
                          ? "Reducir desorden visual, atenuar luces si es posible"
                          : "Reduce visual clutter, dim lights if possible"}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold">
                      {language === "es" ? "Para Crisis" : "For Meltdowns"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
                        {language === "es"
                          ? "Asegurar la seguridad primero - remover peligros"
                          : "Ensure safety first - remove hazards"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
                        {language === "es"
                          ? "Dar espacio, minimizar entrada verbal"
                          : "Give space, minimize verbal input"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
                        {language === "es"
                          ? "Esperar la calma antes de procesar"
                          : "Wait for calm before processing"}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 font-semibold">
                      {language === "es" ? "Prevencion" : "Prevention"}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        {language === "es"
                          ? "Descansos sensoriales regulares programados"
                          : "Regular sensory breaks scheduled"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        {language === "es"
                          ? "Horarios visuales para transiciones"
                          : "Visual schedules for transitions"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        {language === "es"
                          ? "Ensenar senales tempranas de autorregulacion"
                          : "Teach self-regulation early signs"}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reader">
            <ImmersiveReader />
          </TabsContent>
        </Tabs>

        <CrisisProtocolDialog
          open={crisisDialogOpen}
          onOpenChange={setCrisisDialogOpen}
        />
      </div>
  );
}
