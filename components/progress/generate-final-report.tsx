"use client";

import { useEffect, useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useStudents } from "@/contexts/students-context";
import { useTeacherProfile } from "@/contexts/teacher-profile-context";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AssessmentData, ReportLanguageStored, ReportSnapshot } from "@/lib/student-store";
import { buildConversationSummary } from "@/lib/generate-report";
import { downloadFinalReportPdf } from "@/lib/final-report-pdf";
import { toTeacherProfilePdf } from "@/lib/teacher-profile";
import { ShareFamilyReport } from "@/components/progress/share-family-report";
import { Label } from "@/components/ui/label";

interface GenerateFinalReportProps {
  studentId: string;
  studentName: string;
  assessmentData: AssessmentData;
  currentSnapshot?: ReportSnapshot;
  onGenerated?: (snapshot: ReportSnapshot) => void;
}

export function GenerateFinalReport({
  studentId,
  studentName,
  assessmentData,
  currentSnapshot,
  onGenerated,
}: GenerateFinalReportProps) {
  const { t, language } = useLanguage();
  const { updateStudent } = useStudents();
  const { profile } = useTeacherProfile();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSnapshot, setLastSnapshot] = useState<ReportSnapshot | undefined>(currentSnapshot);
  const [reportLanguage, setReportLanguage] = useState<ReportLanguageStored>(
    currentSnapshot?.reportLanguage ?? (language === "es" ? "es" : "en")
  );

  useEffect(() => {
    if (currentSnapshot) {
      setLastSnapshot(currentSnapshot);
      setReportLanguage(currentSnapshot.reportLanguage);
    }
  }, [currentSnapshot]);

  const snapshotToDownload = lastSnapshot ?? currentSnapshot;
  const canDownload = Boolean(snapshotToDownload?.report?.length);

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
        setLastSnapshot(updated.reportSnapshot);
        onGenerated?.(updated.reportSnapshot);
      } else if (data.snapshot) {
        setLastSnapshot(data.snapshot);
        onGenerated?.(data.snapshot);
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

  const handleDownload = () => {
    if (!snapshotToDownload?.report?.length) {
      setError(
        language === "es"
          ? "Primero genera el informe final."
          : "Generate the final report first."
      );
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      downloadFinalReportPdf({
        studentName,
        assessmentData,
        snapshot: snapshotToDownload,
        uiLanguage: language === "es" ? "es" : "en",
        teacherProfile: toTeacherProfilePdf(profile),
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t("progress.downloadPdfError"));
    } finally {
      setDownloading(false);
    }
  };

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

      <div className="space-y-2">
        <Label htmlFor="report-language">{t("progress.reportLanguage")}</Label>
        <select
          id="report-language"
          value={reportLanguage}
          onChange={(e) => setReportLanguage(e.target.value as ReportLanguageStored)}
          className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled={loading}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="kaqchikel">Kaqchikel</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void handleGenerate()} disabled={loading || !hasConversation}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {loading ? t("progress.generatingReport") : t("progress.generateFinalReport")}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => void handleDownload()}
          disabled={!canDownload || downloading || loading}
        >
          {downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {downloading ? t("progress.downloadingPdf") : t("progress.downloadFinalReportPdf")}
        </Button>
      </div>

      <ShareFamilyReport studentId={studentId} snapshot={snapshotToDownload} />
    </div>
  );
}
