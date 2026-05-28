"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useStudents } from "@/contexts/students-context";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AssessmentData, ReportSnapshot } from "@/lib/student-store";
import { buildConversationSummary } from "@/lib/generate-report";

interface GenerateFinalReportProps {
  studentId: string;
  assessmentData: AssessmentData;
  currentSnapshot?: ReportSnapshot;
  onGenerated?: (snapshot: ReportSnapshot) => void;
}

export function GenerateFinalReport({
  studentId,
  assessmentData,
  currentSnapshot,
  onGenerated,
}: GenerateFinalReportProps) {
  const { t, language } = useLanguage();
  const { updateStudent } = useStudents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasConversation =
    assessmentData.aiResponses.length > 0 ||
    (assessmentData.followUpLog?.length ?? 0) > 0;

  const handleGenerate = async () => {
    if (!hasConversation) {
      setError(t("progress.noConversationForReport"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reportLanguage = currentSnapshot?.reportLanguage ?? (language === "es" ? "es" : "en");

      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentData,
          reportLanguage,
          language: language === "es" ? "es" : "en",
        }),
      });

      const data = (await response.json()) as {
        snapshot?: ReportSnapshot;
        error?: string;
      };

      if (!response.ok || !data.snapshot) {
        throw new Error(data.error ?? t("progress.reportGenerateError"));
      }

      const updated = await updateStudent(studentId, {
        reportSnapshot: data.snapshot,
      });

      if (updated?.reportSnapshot) {
        onGenerated?.(updated.reportSnapshot);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t("progress.reportGenerateError"));
    } finally {
      setLoading(false);
    }
  };

  const summaryPreview = buildConversationSummary(
    assessmentData,
    language === "es" ? "es" : "en"
  );
  const turnCount =
    assessmentData.aiResponses.length + (assessmentData.followUpLog?.length ?? 0);

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div>
        <h4 className="font-medium">{t("progress.generateFinalReport")}</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("progress.generateFinalReportHint")}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("progress.conversationTurns")}: {turnCount} ·{" "}
          {language === "es" ? "Caracteres en historial" : "History chars"}:{" "}
          {summaryPreview.length}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={() => void handleGenerate()} disabled={loading || !hasConversation}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {loading ? t("progress.generatingReport") : t("progress.generateFinalReport")}
      </Button>
    </div>
  );
}
