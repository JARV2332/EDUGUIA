"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Link2, Loader2, Unlink } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import type { ReportSnapshot } from "@/lib/student-store";
import { buildShareUrl } from "@/lib/share-report";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

interface ShareFamilyReportProps {
  studentId: string;
  snapshot?: ReportSnapshot;
}

export function ShareFamilyReport({ studentId, snapshot }: ShareFamilyReportProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canShare = Boolean(snapshot?.report?.length);

  const handleCreateLink = async () => {
    if (!canShare) return;
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch(`/api/students/${studentId}/share-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysValid: 30 }),
      });
      const data = (await res.json()) as {
        url?: string;
        expiresAt?: string;
        error?: string;
      };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? t("progress.shareError"));
      }

      setShareUrl(data.url);
      setExpiresAt(data.expiresAt ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("progress.shareError"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(language === "es" ? "No se pudo copiar el enlace." : "Could not copy link.");
    }
  }, [shareUrl, language]);

  const handleRevoke = async () => {
    setRevoking(true);
    setError(null);
    try {
      const res = await fetch(`/api/students/${studentId}/share-report`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? t("progress.shareRevokeError"));
      }
      setShareUrl(null);
      setExpiresAt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("progress.shareRevokeError"));
    } finally {
      setRevoking(false);
    }
  };

  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString(language === "es" ? "es-GT" : "en-US", {
        dateStyle: "medium",
      })
    : null;

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
      <div>
        <h4 className="flex items-center gap-2 font-medium">
          <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
          {t("progress.shareWithFamily")}
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">{t("progress.shareWithFamilyHint")}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleCreateLink()}
          disabled={!canShare || loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {loading ? t("progress.shareCreating") : t("progress.shareCreateLink")}
        </Button>

        {shareUrl && (
          <Button type="button" variant="outline" onClick={() => void handleRevoke()} disabled={revoking}>
            {revoking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Unlink className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {t("progress.shareRevoke")}
          </Button>
        )}
      </div>

      {shareUrl && (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={shareUrl} className="font-mono text-xs" aria-label={t("progress.shareLinkLabel")} />
            <Button type="button" variant="outline" className="shrink-0" onClick={() => void handleCopy()}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-600" aria-hidden="true" />
              ) : (
                <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {copied ? t("progress.shareCopied") : t("progress.shareCopy")}
            </Button>
          </div>
          {expiryLabel && (
            <p className="text-xs text-muted-foreground">
              {t("progress.shareExpires")}: {expiryLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
