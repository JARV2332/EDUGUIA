"use client";

import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ToolkitResource, ToolkitResourceLink } from "@/lib/toolkit-content";
import { linkIcon } from "@/lib/toolkit-content";

interface ToolkitResourceDialogProps {
  resource: ToolkitResource | null;
  locale: "es" | "en";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ResourceLink({ link }: { link: ToolkitResourceLink }) {
  const Icon = linkIcon(link.type);
  return (
    <li>
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {link.label}
      </a>
    </li>
  );
}

export function ToolkitResourceDialog({
  resource,
  locale,
  open,
  onOpenChange,
}: ToolkitResourceDialogProps) {
  if (!resource) return null;

  const title = locale === "es" ? resource.titleEs : resource.titleEn;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {locale === "es" ? resource.descriptionEs : resource.descriptionEn}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {resource.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="mb-2 font-semibold text-sm">{section.heading}</h3>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="mb-2 text-sm text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
              {section.links && section.links.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <ResourceLink key={link.href} link={link} />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
          {locale === "es" ? "Cerrar" : "Close"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function ToolkitResourceCard({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border bg-card text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-4 p-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}
