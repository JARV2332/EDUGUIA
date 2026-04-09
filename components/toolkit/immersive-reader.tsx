"use client";

import { useState } from "react";
import { useAccessibility } from "@/contexts/accessibility-context";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Volume2,
  VolumeX,
  Wand2,
  Settings2,
  Image,
} from "lucide-react";

function simplifyText(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  return sentences
    .map((sentence) => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 12) {
        return words.slice(0, 12).join(" ") + "...";
      }
      return sentence.trim();
    })
    .join(". ") + ".";
}

function highlightKeywords(text: string, language: string): React.ReactNode[] {
  const keywordsEn = ["Sun", "planets", "Earth", "solar system", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "moons", "life"];
  const keywordsEs = ["Sol", "planetas", "Tierra", "sistema solar", "Mercurio", "Venus", "Marte", "Jupiter", "Saturno", "Urano", "Neptuno", "lunas", "vida"];
  const keywords = language === "es" ? keywordsEs : keywordsEn;
  
  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    let earliestMatch: { keyword: string; index: number } | null = null;
    
    for (const keyword of keywords) {
      const index = remaining.toLowerCase().indexOf(keyword.toLowerCase());
      if (index !== -1 && (earliestMatch === null || index < earliestMatch.index)) {
        earliestMatch = { keyword, index };
      }
    }
    
    if (earliestMatch) {
      if (earliestMatch.index > 0) {
        result.push(remaining.slice(0, earliestMatch.index));
      }
      const matchedText = remaining.slice(earliestMatch.index, earliestMatch.index + earliestMatch.keyword.length);
      result.push(
        <mark key={key++} className="rounded bg-primary/20 px-1 font-medium text-primary">
          {matchedText}
        </mark>
      );
      remaining = remaining.slice(earliestMatch.index + earliestMatch.keyword.length);
    } else {
      result.push(remaining);
      break;
    }
  }
  
  return result;
}

export function ImmersiveReader() {
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();
  const { t, language } = useLanguage();

  const sampleTextEn = `The solar system is made up of the Sun and all the objects that orbit around it. This includes eight planets, their moons, dwarf planets, asteroids, and comets. The Sun is at the center and provides light and heat to all the planets.

The planets closest to the Sun are Mercury, Venus, Earth, and Mars. These are called the inner planets or rocky planets because they have solid, rocky surfaces. Earth is the only planet known to support life.

The outer planets are Jupiter, Saturn, Uranus, and Neptune. These are called gas giants because they are much larger and made mostly of gases. Saturn is famous for its beautiful rings made of ice and rock.`;

  const sampleTextEs = `El sistema solar esta formado por el Sol y todos los objetos que orbitan a su alrededor. Esto incluye ocho planetas, sus lunas, planetas enanos, asteroides y cometas. El Sol esta en el centro y proporciona luz y calor a todos los planetas.

Los planetas mas cercanos al Sol son Mercurio, Venus, Tierra y Marte. Estos se llaman planetas interiores o planetas rocosos porque tienen superficies solidas y rocosas. La Tierra es el unico planeta conocido que sostiene vida.

Los planetas exteriores son Jupiter, Saturno, Urano y Neptuno. Estos se llaman gigantes gaseosos porque son mucho mas grandes y estan hechos principalmente de gases. Saturno es famoso por sus hermosos anillos hechos de hielo y roca.`;

  const sampleText = language === "es" ? sampleTextEs : sampleTextEn;
  
  const [inputText, setInputText] = useState(sampleText);
  const [fontSize, setFontSize] = useState([18]);
  const [lineHeight, setLineHeight] = useState([2]);
  const [showSimplified, setShowSimplified] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showPictograms, setShowPictograms] = useState(false);
  const [highlightWords, setHighlightWords] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const displayText = showSimplified ? simplifyText(inputText) : inputText;

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(displayText);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
            {language === "es" ? "Texto de Entrada" : "Input Text"}
          </CardTitle>
          <CardDescription>
            {t("reader.pasteText")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            placeholder={t("reader.pasteText")}
            aria-label={language === "es" ? "Texto a transformar" : "Text to transform"}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setInputText(sampleText)}
            >
              {language === "es" ? "Cargar Ejemplo" : "Load Sample"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("reader.textSettings")}
            </Button>
          </div>

          {showSettings && (
            <div className="space-y-6 rounded-lg border bg-muted/30 p-4">
              <div className="space-y-3">
                <Label>{t("reader.fontSize")}: {fontSize[0]}px</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={14}
                  max={28}
                  step={1}
                  aria-label={t("reader.fontSize")}
                />
              </div>

              <div className="space-y-3">
                <Label>{t("reader.lineHeight")}: {lineHeight[0]}</Label>
                <Slider
                  value={lineHeight}
                  onValueChange={setLineHeight}
                  min={1.2}
                  max={3}
                  step={0.1}
                  aria-label={t("reader.lineHeight")}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="simplified">{t("reader.simplifyText")}</Label>
                  <Switch
                    id="simplified"
                    checked={showSimplified}
                    onCheckedChange={setShowSimplified}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="contrast">{t("reader.highContrast")}</Label>
                  <Switch
                    id="contrast"
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="highlight">{t("reader.highlightKeywords")}</Label>
                  <Switch
                    id="highlight"
                    checked={highlightWords}
                    onCheckedChange={setHighlightWords}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pictograms">{t("reader.syllables")}</Label>
                  <Switch
                    id="pictograms"
                    checked={showPictograms}
                    onCheckedChange={setShowPictograms}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" aria-hidden="true" />
            {language === "es" ? "Vista Transformada" : "Transformed View"}
          </CardTitle>
          <CardDescription>
            {language === "es" 
              ? "Version accesible y facil de leer del texto" 
              : "Accessible, reader-friendly version of the text"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleSpeak}
              variant={isSpeaking ? "destructive" : "default"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("reader.stopSpeaking")}
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("reader.speak")}
                </>
              )}
            </Button>
          </div>

          <div
            className={cn(
              "min-h-[300px] rounded-lg border p-6 transition-colors",
              highContrast
                ? "bg-black text-white"
                : "bg-card"
            )}
            style={{
              fontSize: `${fontSize[0]}px`,
              lineHeight: lineHeight[0],
            }}
            role="region"
            aria-label={language === "es" ? "Texto transformado" : "Transformed text output"}
            aria-live="polite"
          >
            {showPictograms && (
              <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
                <div className="flex items-center gap-2 rounded bg-muted px-2 py-1 text-sm">
                  <Image className="h-4 w-4" aria-hidden="true" />
                  <span>{language === "es" ? "Sol" : "Sun"}</span>
                </div>
                <div className="flex items-center gap-2 rounded bg-muted px-2 py-1 text-sm">
                  <Image className="h-4 w-4" aria-hidden="true" />
                  <span>{language === "es" ? "Planeta" : "Planet"}</span>
                </div>
                <div className="flex items-center gap-2 rounded bg-muted px-2 py-1 text-sm">
                  <Image className="h-4 w-4" aria-hidden="true" />
                  <span>{language === "es" ? "Tierra" : "Earth"}</span>
                </div>
              </div>
            )}
            <div className="leading-relaxed">
              {highlightWords ? highlightKeywords(displayText, language) : displayText}
            </div>
          </div>

          {showSimplified && (
            <p className="text-sm text-muted-foreground">
              {language === "es"
                ? "El texto ha sido simplificado para facilitar la comprension lectora."
                : "Text has been simplified for easier reading comprehension."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
