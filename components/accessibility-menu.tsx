"use client";

import { useState } from "react";
import { useAccessibility } from "@/contexts/accessibility-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accessibility, Eye, Type, ZoomIn, X, Globe } from "lucide-react";

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleHighContrast, toggleDyslexicFont, toggleLargeText } = useAccessibility();
  const { language, setLanguage, t } = useLanguage();

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-50 h-12 w-12 rounded-full shadow-lg sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        size="icon"
        aria-label={isOpen ? t("common.close") : t("a11y.title")}
        aria-expanded={isOpen}
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {isOpen && (
        <Card className="fixed bottom-40 right-4 z-50 w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] shadow-xl sm:bottom-24 sm:right-6 sm:w-80" role="dialog" aria-label={t("a11y.title")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Accessibility className="h-5 w-5" />
              {t("a11y.title")}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Label className="cursor-pointer">{t("language")}</Label>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className="h-8 px-3 text-xs"
                  aria-pressed={language === "en"}
                >
                  EN
                </Button>
                <Button
                  variant={language === "es" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("es")}
                  className="h-8 px-3 text-xs"
                  aria-pressed={language === "es"}
                >
                  ES
                </Button>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Label htmlFor="high-contrast" className="cursor-pointer">
                  {t("a11y.highContrast")}
                </Label>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={toggleHighContrast}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Label htmlFor="dyslexic-font" className="cursor-pointer">
                  {t("a11y.dyslexicFont")}
                </Label>
              </div>
              <Switch
                id="dyslexic-font"
                checked={settings.dyslexicFont}
                onCheckedChange={toggleDyslexicFont}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ZoomIn className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Label htmlFor="large-text" className="cursor-pointer">
                  {t("a11y.largeText")}
                </Label>
              </div>
              <Switch
                id="large-text"
                checked={settings.largeText}
                onCheckedChange={toggleLargeText}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
