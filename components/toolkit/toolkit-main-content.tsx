"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { SensoryCrisisButton } from "@/components/toolkit/sensory-crisis-button";
import { ImmersiveReader } from "@/components/toolkit/immersive-reader";
import { CrisisProtocolDialog } from "@/components/toolkit/crisis-protocol-dialog";
import {
  ToolkitResourceCard,
  ToolkitResourceDialog,
} from "@/components/toolkit/toolkit-resource-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BookOpen,
  Clock,
  ExternalLink,
  Heart,
  Phone,
  Shield,
} from "lucide-react";
import {
  TOOLKIT_EXTERNAL_RESOURCES,
  TOOLKIT_QUICK_RESOURCES,
  type ToolkitResource,
} from "@/lib/toolkit-content";

const QUICK_ICONS = {
  breathing: Heart,
  "quiet-space": Shield,
  emergency: Phone,
  timeout: Clock,
} as const;

export function ToolkitMainContent() {
  const [crisisDialogOpen, setCrisisDialogOpen] = useState(false);
  const [activeResource, setActiveResource] = useState<ToolkitResource | null>(null);
  const { t, language } = useLanguage();
  const locale = language === "es" ? "es" : "en";

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("toolkit.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("toolkit.subtitle")}</p>
      </header>

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
            {TOOLKIT_QUICK_RESOURCES.map((resource) => {
              const Icon = QUICK_ICONS[resource.id as keyof typeof QUICK_ICONS] ?? Heart;
              return (
                <ToolkitResourceCard
                  key={resource.id}
                  title={locale === "es" ? resource.titleEs : resource.titleEn}
                  description={locale === "es" ? resource.descriptionEs : resource.descriptionEn}
                  icon={Icon}
                  onClick={() => setActiveResource(resource)}
                />
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("toolkit.externalResources")}</CardTitle>
              <CardDescription>{t("toolkit.externalResourcesHint")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {TOOLKIT_EXTERNAL_RESOURCES.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-sm">{t(item.titleKey)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t(item.descKey)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" aria-hidden="true" />
                {locale === "es"
                  ? "Referencia rápida de estrategias de calma"
                  : "Calming strategies quick reference"}
              </CardTitle>
              <CardDescription>
                {locale === "es"
                  ? "Técnicas basadas en evidencia para desescalada y regulación emocional"
                  : "Evidence-based techniques for de-escalation and emotional regulation"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-semibold">
                    {locale === "es" ? "Para ansiedad/pánico" : "For anxiety/panic"}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {locale === "es"
                        ? "Técnica de anclaje: 5 cosas que ves, 4 que oyes, 3 que tocas"
                        : "Grounding: 5 things you see, 4 you hear, 3 you touch"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {locale === "es"
                        ? "Respiración cuadrada: 4 tiempos inhalar, sostener, exhalar, sostener"
                        : "Box breathing: 4 counts in, hold, out, hold"}
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-semibold">
                    {locale === "es" ? "Para sobrecarga sensorial" : "For sensory overload"}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                      {locale === "es"
                        ? "Mover a un ambiente de baja estimulación"
                        : "Move to low-stimulation environment"}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                      {locale === "es"
                        ? "Ofrecer audífonos con cancelación de ruido"
                        : "Offer noise-canceling headphones"}
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

      <CrisisProtocolDialog open={crisisDialogOpen} onOpenChange={setCrisisDialogOpen} />

      <ToolkitResourceDialog
        resource={activeResource}
        locale={locale}
        open={!!activeResource}
        onOpenChange={(open) => {
          if (!open) setActiveResource(null);
        }}
      />
    </>
  );
}
