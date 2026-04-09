"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ClipboardList, Eye, Trophy, Lightbulb } from "lucide-react";
import type { TimelineEntry } from "@/app/progress/page";

interface QuickLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  onSubmit: (entry: Omit<TimelineEntry, "id" | "date" | "author">) => void;
}

export function QuickLogDialog({
  open,
  onOpenChange,
  studentName,
  onSubmit,
}: QuickLogDialogProps) {
  const [type, setType] = useState<TimelineEntry["type"]>("observation");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { t, language } = useLanguage();

  const entryTypes = [
    { value: "observation", label: t("progress.observation"), icon: Eye },
    { value: "milestone", label: t("progress.milestone"), icon: Trophy },
    { value: "intervention", label: t("progress.intervention"), icon: Lightbulb },
    { value: "assessment", label: t("nav.assessment"), icon: ClipboardList },
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      type,
      title: title.trim(),
      description: description.trim(),
    });

    setType("observation");
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("quickLog.title")}</DialogTitle>
            <DialogDescription>
              {language === "es" 
                ? `Registrar una observacion, hito o intervencion para ${studentName}`
                : `Record an observation, milestone, or intervention for ${studentName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <fieldset>
              <legend className="mb-3 text-sm font-medium">
                {language === "es" ? "Tipo de Entrada" : "Entry Type"}
              </legend>
              <RadioGroup
                value={type}
                onValueChange={(value) => setType(value as TimelineEntry["type"])}
                className="grid grid-cols-2 gap-4"
              >
                {entryTypes.map((entryType) => {
                  const Icon = entryType.icon;
                  return (
                    <div key={entryType.value}>
                      <RadioGroupItem
                        value={entryType.value}
                        id={entryType.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={entryType.value}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-muted p-4 transition-colors hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        <span>{entryType.label}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="title">{language === "es" ? "Titulo" : "Title"}</Label>
              <Input
                id="title"
                placeholder={language === "es" ? "Titulo breve para esta entrada" : "Brief title for this entry"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{language === "es" ? "Descripcion" : "Description"}</Label>
              <Textarea
                id="description"
                placeholder={t("quickLog.notesPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!title.trim() || !description.trim()}>
              {t("quickLog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
