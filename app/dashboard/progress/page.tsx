"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import { useLanguage } from "@/contexts/language-context";
import { useStudents } from "@/contexts/students-context";
import { StudentSelector } from "@/components/progress/student-selector";
import { ProgressTimeline } from "@/components/progress/progress-timeline";
import { ProgressChart } from "@/components/progress/progress-chart";
import { QuickLogDialog } from "@/components/progress/quick-log-dialog";
import { StudentAgentPanel } from "@/components/progress/student-agent-panel";
import { StudentReportView } from "@/components/progress/student-report-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Calendar, BarChart3, FileDown, MessageSquare, FileText } from "lucide-react";
import type { TimelineEntry, SubjectStrategiesStored, ReportSnapshot } from "@/lib/student-store";
import { createClient } from "@/lib/supabase/client";
import { plansToFollowUpLog } from "@/lib/student-interventions";

export type { TimelineEntry };

export interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  initialAssessment: string;
  currentProgress: { social: number; academic: number; emotional: number };
  initialState: { social: number; academic: number; emotional: number };
}

function savedToStudent(saved: { id: string; name: string; age: string; completedAt: string; assessmentData: { neurodivergence: { attention: boolean; hyperactivity: boolean; socialInteraction: boolean; anxiety: boolean; sensoryOverload: boolean } } }): Student {
  const age = parseInt(saved.age, 10) || 0;
  const n = saved.assessmentData.neurodivergence;
  const needs = [n.attention, n.hyperactivity, n.socialInteraction, n.anxiety, n.sensoryOverload].filter(Boolean).length;
  const base = Math.max(40, 70 - needs * 8);
  const initial = { social: base, academic: base, emotional: base };
  const current = { social: Math.min(100, base + 5), academic: Math.min(100, base + 5), emotional: Math.min(100, base + 5) };
  return {
    id: saved.id,
    name: saved.name,
    age,
    grade: "—",
    initialAssessment: saved.completedAt,
    currentProgress: current,
    initialState: initial,
  };
}

function ProgressPageContent() {
  const searchParams = useSearchParams();
  const studentFromUrl = searchParams.get("student");
  const { students: savedStudents, updateTimeline, updateStudent, refreshFromSupabase } =
    useStudents();
  const students: Student[] = useMemo(
    () => savedStudents.map((s) => savedToStudent(s)),
    [savedStudents]
  );

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const { t, language } = useLanguage();

  const effectiveStudent = selectedStudent ?? students[0] ?? null;
  const savedSelected = effectiveStudent ? savedStudents.find((s) => s.id === effectiveStudent.id) : null;

  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  useEffect(() => {
    if (studentFromUrl && students.length > 0) {
      const match = students.find((s) => s.id === studentFromUrl);
      if (match) setSelectedStudent(match);
    } else if (selectedStudent === null && students.length > 0) {
      setSelectedStudent(students[0]);
    }
  }, [students.length, selectedStudent, studentFromUrl, students]);

  useEffect(() => {
    if (!effectiveStudent || !savedSelected) return;
    setTimeline(savedSelected.timeline);
  }, [effectiveStudent?.id]);

  /** Migra seguimientos antiguos de planes_intervencion a followUpLog si aún no están guardados. */
  useEffect(() => {
    if (!savedSelected?.id) return;
    if ((savedSelected.assessmentData.followUpLog?.length ?? 0) > 0) return;

    let cancelled = false;
    const hydrate = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("planes_intervencion")
          .select("id, observacion_docente, respuesta_ia, created_at")
          .eq("estudiante_id", savedSelected.id)
          .order("created_at", { ascending: true });
        if (cancelled || !data?.length) return;
        const log = plansToFollowUpLog(data);
        if (log.length === 0) return;
        await updateStudent(savedSelected.id, {
          assessmentData: { followUpLog: log },
        });
      } catch (e) {
        console.error("Error hidratando seguimiento:", e);
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [savedSelected?.id, savedSelected?.assessmentData.followUpLog?.length, updateStudent]);

  const handleStudentChange = (student: Student) => {
    setSelectedStudent(student);
    const saved = savedStudents.find((s) => s.id === student.id);
    setTimeline(saved?.timeline ?? []);
  };

  const handleFollowUpSaved = (userMessage: string, assistantReply: string) => {
    if (!savedSelected) return;
    void updateStudent(savedSelected.id, {
      appendFollowUp: { user: userMessage, assistant: assistantReply },
    });
  };

  const handleReportUpdated = (_snapshot: ReportSnapshot) => {
    void refreshFromSupabase();
  };

  const handleFollowUpSent = (userMessage: string) => {
    if (!savedSelected) return;
    const newEntry: TimelineEntry = {
      id: timeline.length + 1,
      date: new Date().toISOString().split("T")[0],
      type: "intervention",
      title: language === "es" ? "Seguimiento con EduGuIA" : "EduGuIA follow-up",
      description:
        userMessage.length > 200 ? `${userMessage.slice(0, 200)}…` : userMessage,
      author: "EduGuIA",
    };
    const newTimeline = [newEntry, ...timeline];
    setTimeline(newTimeline);
    updateTimeline(savedSelected.id, newTimeline);
  };

  const handleAddLog = (entry: Omit<TimelineEntry, "id" | "date" | "author">) => {
    if (!savedSelected) return;
    const newEntry: TimelineEntry = {
      ...entry,
      id: timeline.length + 1,
      date: new Date().toISOString().split("T")[0],
      author: "Usuario",
    };
    const newTimeline = [newEntry, ...timeline];
    setTimeline(newTimeline);
    updateTimeline(savedSelected.id, newTimeline);
  };

  const domainLabels = {
    social: language === "es" ? "Social" : "Social",
    academic: language === "es" ? "Academico" : "Academic",
    emotional: language === "es" ? "Emocional" : "Emotional",
  };

  const PROGRESS_PDF_LABELS = {
    es: {
      title: "Informe de seguimiento",
      timeline: "Línea de tiempo",
      progressSummary: "Resumen de progreso",
      initial: "Inicial",
      current: "Actual",
      strategies: "Estrategias por materia",
      familyKaqchikel: "Resumen para la familia en Kaqchikel",
      footer: "Informe generado por EDUGUIA. No constituye diagnóstico clínico.",
      subjectKeys: { numeracy: "Área numérica", language: "Lenguaje", foreignLanguage: "Nuevo idioma", arts: "Artes", ict: "TIC", other: "Otros" } as Record<string, string>,
    },
    en: {
      title: "Progress report",
      timeline: "Timeline",
      progressSummary: "Progress summary",
      initial: "Initial",
      current: "Current",
      strategies: "Subject strategies",
      familyKaqchikel: "Family summary (Kaqchikel)",
      footer: "Report generated by EDUGUIA. Does not constitute a clinical diagnosis.",
      subjectKeys: { numeracy: "Numeracy", language: "Language", foreignLanguage: "New language", arts: "Arts", ict: "ICT", other: "Other" } as Record<string, string>,
    },
  };

  const handleDownloadReport = async () => {
    if (!effectiveStudent || !savedSelected) return;
    try {
      let logoBase64: string | null = null;
      try {
        const res = await fetch("/logo.jpeg");
        const blob = await res.blob();
        logoBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } catch {
        // Sin logo si falla
      }

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageHeight = 297;
      const marginTop = 22;
      const marginLeft = 20;
      const marginRight = 20;
      const maxWidth = 210 - marginLeft - marginRight;
      const lineHeight = 5.5;
      const bottomMargin = 25;
      const maxY = pageHeight - bottomMargin;
      let cursorY = marginTop;

      const maybeNewPage = (needed: number) => {
        if (cursorY + needed > maxY) {
          doc.addPage();
          cursorY = marginTop;
          if (logoBase64) {
            doc.addImage(logoBase64, "JPEG", marginLeft, 8, 45, 18);
            cursorY = 8 + 18 + 4;
          }
        }
      };

      if (logoBase64) {
        doc.addImage(logoBase64, "JPEG", marginLeft, 8, 45, 18);
        cursorY = 8 + 18 + 4;
      }

      const labels = PROGRESS_PDF_LABELS[language === "es" ? "es" : "en"];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`${labels.title} - ${effectiveStudent.name}`, marginLeft, cursorY);
      cursorY += lineHeight + 3;

      const drawLines = (lines: string[]) => {
        for (const line of lines) {
          maybeNewPage(lineHeight);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const wrapped = doc.splitTextToSize(line, maxWidth);
          wrapped.forEach((l) => {
            doc.text(l, marginLeft, cursorY);
            cursorY += lineHeight;
          });
        }
      };

      const addSectionTitle = (text: string) => {
        maybeNewPage(8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(text, marginLeft, cursorY);
        cursorY += lineHeight + 2;
      };

      const addBulletList = (items: string[]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const bullet = "  \u2022 ";
        items.forEach((item) => {
          const wrapped = doc.splitTextToSize(bullet + String(item).trim(), maxWidth - 8);
          wrapped.forEach((l, i) => {
            maybeNewPage(lineHeight);
            doc.text(l, marginLeft, cursorY);
            cursorY += lineHeight;
          });
        });
        cursorY += 2;
      };

      const snapshot = savedSelected.reportSnapshot;
      const reportLang = snapshot?.reportLanguage ?? (language === "es" ? "es" : "en");

      if (snapshot && snapshot.report.length > 0) {
        snapshot.report.forEach((section) => {
          addSectionTitle(section.title);
          addBulletList(section.content);
        });
      }

      if (snapshot?.subjectStrategies) {
        const ss = snapshot.subjectStrategies as SubjectStrategiesStored;
        addSectionTitle(labels.strategies);
        const keys = ["numeracy", "language", "foreignLanguage", "arts", "ict", "other"] as const;
        keys.forEach((key) => {
          const items = ss[key];
          if (items && items.length > 0) {
            const label = labels.subjectKeys[key] || key;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            maybeNewPage(lineHeight);
            doc.text(label + ":", marginLeft, cursorY);
            cursorY += lineHeight;
            addBulletList(items);
          }
        });
      }

      if (snapshot?.familySummaryKaqchikel?.length) {
        addSectionTitle(labels.familyKaqchikel);
        addBulletList(snapshot.familySummaryKaqchikel);
      }

      addSectionTitle(labels.timeline);
      timeline.forEach((entry) => {
        const line = `[${entry.date}] ${entry.type}: ${entry.title} - ${entry.description}`;
        const wrapped = doc.splitTextToSize("  \u2022 " + line, maxWidth - 8);
        wrapped.forEach((l) => {
          maybeNewPage(lineHeight);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(l, marginLeft, cursorY);
          cursorY += lineHeight;
        });
      });
      if (timeline.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(language === "es" ? "  Sin entradas aún." : "  No entries yet.", marginLeft, cursorY);
        cursorY += lineHeight + 2;
      } else cursorY += 2;

      addSectionTitle(labels.progressSummary);
      (["social", "academic", "emotional"] as const).forEach((domain) => {
        const initial = effectiveStudent.initialState[domain];
        const current = effectiveStudent.currentProgress[domain];
        const label = domainLabels[domain];
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        maybeNewPage(lineHeight * 2);
        doc.text(`${label}: ${labels.initial} ${initial}% \u2192 ${labels.current} ${current}%`, marginLeft, cursorY);
        cursorY += lineHeight;
        const barW = maxWidth * 0.4;
        doc.setDrawColor(200, 200, 200);
        doc.rect(marginLeft, cursorY - 2, barW, 3);
        doc.setFillColor(33, 150, 243);
        doc.rect(marginLeft, cursorY - 2, (barW * current) / 100, 3, "F");
        cursorY += 5;
      });

      maybeNewPage(12);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const footerLines = doc.splitTextToSize(labels.footer, maxWidth);
      footerLines.forEach((l: string) => {
        doc.text(l, marginLeft, cursorY);
        cursorY += lineHeight;
      });

      const safeName = effectiveStudent.name.replace(/\s+/g, "_").slice(0, 30);
      doc.save(`Informe_Seguimiento_${safeName}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert(language === "es" ? "No se pudo generar el PDF." : "Could not generate PDF.");
    }
  };

  const ASSESSMENT_PDF_LABELS: Record<"es" | "en" | "kaqchikel", { student: string; profile: string; age: string; ageNotSpec: string; sensorial: string; neuro: string; notes: string; convSummary: string; familyKaqchikel: string; footer: string }> = {
    es: { student: "Alumno", profile: "Perfil general del alumno", age: "Edad (dato ingresado)", ageNotSpec: "no especificada", sensorial: "Sensorial y físico", neuro: "Neurodivergencia", notes: "Notas adicionales", convSummary: "Resumen de la conversación con IA", familyKaqchikel: "Resumen para la familia en Kaqchikel", footer: "Este informe es una orientación basada en los datos recopilados y el análisis asistido por IA. No constituye un diagnóstico clínico." },
    en: { student: "Student", profile: "General student profile", age: "Age (entered)", ageNotSpec: "not specified", sensorial: "Sensorial/physical", neuro: "Neurodivergence", notes: "Additional notes", convSummary: "Summary of AI conversation", familyKaqchikel: "Resumen para la familia en Kaqchikel", footer: "This report is guidance based on collected data and AI-assisted analysis. It does not constitute a clinical diagnosis." },
    kaqchikel: { student: "Ri ala'", profile: "Ri ruk'wajinem ri ala'", age: "Rujunaab' (k'utunikil)", ageNotSpec: "man k'utun ta", sensorial: "Sik'inem chuqa' no'j", neuro: "Ri ruk'u'x chuqa' ri sik'inem", notes: "Juley chik tz'ib'axik", convSummary: "Rutz'ib'axik k'amol pa IA", familyKaqchikel: "Rutz'ib'axik richin ri ajay chi Kaqchikel", footer: "Re rutz'ib'axik re' jun to'ob'al ruma ri k'utunikil chuqa' ri IA. Man jun k'ak'a' tz'etem ta." },
  };

  const handleDownloadAssessmentReport = async () => {
    if (!effectiveStudent || !savedSelected) return;
    const snapshot = savedSelected.reportSnapshot;
    const data = savedSelected.assessmentData;
    if (!snapshot || snapshot.report.length === 0) {
      alert(language === "es" ? "No hay informe de evaluación guardado para este estudiante. Complete una evaluación y exporte o guarde el informe." : "No saved assessment report for this student. Complete an assessment and export or save the report.");
      return;
    }
    try {
      let logoBase64: string | null = null;
      try {
        const res = await fetch("/logo.jpeg");
        const blob = await res.blob();
        logoBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } catch {
        // Sin logo
      }

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageHeight = 297;
      const marginTop = 22;
      const marginLeft = 20;
      const marginRight = 20;
      const maxWidth = 210 - marginLeft - marginRight;
      const lineHeight = 5.5;
      const lineHeightTitle = 7;
      const bottomMargin = 25;
      const maxY = pageHeight - bottomMargin;
      let cursorY = marginTop;

      if (logoBase64) {
        doc.addImage(logoBase64, "JPEG", marginLeft, 8, 45, 18);
        cursorY = 8 + 18 + 4;
      }

      const maybeNewPage = (needed: number) => {
        if (cursorY + needed > maxY) {
          doc.addPage();
          cursorY = marginTop;
          if (logoBase64) {
            doc.addImage(logoBase64, "JPEG", marginLeft, 8, 45, 18);
            cursorY = 8 + 18 + 4;
          }
        }
      };

      const drawLines = (lines: string[]) => {
        for (const line of lines) {
          maybeNewPage(lineHeight);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const wrapped = doc.splitTextToSize(line, maxWidth);
          wrapped.forEach((l: string) => {
            doc.text(l, marginLeft, cursorY);
            cursorY += lineHeight;
          });
        }
      };

      const addTitle = (text: string) => {
        maybeNewPage(lineHeightTitle * 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((l: string) => {
          doc.text(l, marginLeft, cursorY);
          cursorY += lineHeight;
        });
        cursorY += 3;
      };

      const addSubtitle = (text: string) => {
        maybeNewPage(lineHeightTitle);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((l: string) => {
          doc.text(l, marginLeft, cursorY);
          cursorY += lineHeight;
        });
        cursorY += 4;
      };

      const addSectionTitle = (text: string) => {
        maybeNewPage(lineHeightTitle + 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(text, marginLeft, cursorY);
        cursorY += lineHeight + 2;
      };

      const addBulletList = (items: string[]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const bullet = "  \u2022 ";
        items.forEach((item) => {
          const wrapped = doc.splitTextToSize(bullet + String(item).trim(), maxWidth - 8);
          wrapped.forEach((l: string) => {
            maybeNewPage(lineHeight);
            doc.text(l, marginLeft, cursorY);
            cursorY += lineHeight;
          });
        });
        cursorY += 2;
      };

      const reportLang = snapshot.reportLanguage;
      const labels = ASSESSMENT_PDF_LABELS[reportLang];
      const studentName = (data.studentName || (language === "es" ? "Estudiante sin nombre" : "Unnamed student")).trim() || "Alumno";
      const pdfTitleByLang = reportLang === "kaqchikel" ? "Rutz'ib'axik richin junamaj (Kaqchikel)" : reportLang === "en" ? "Inclusive Psychoeducational Report (English)" : "Informe Psicopedagogico de Inclusion (Espanol)";

      addTitle(pdfTitleByLang);
      addSubtitle(`${labels.student}: ${studentName}`);
      cursorY += 2;

      addSectionTitle(labels.profile);
      const yesNo = reportLang === "en" ? ["yes", "no"] : reportLang === "kaqchikel" ? ["ja", "mani"] : ["sí", "no"];
      const overviewLines = [
        `${labels.age}: ${data.studentAge || labels.ageNotSpec}`,
        `${labels.sensorial}: vista=${data.sensorial.visualImpairment}, audicion=${data.sensorial.hearingImpairment}, motricidad=${data.sensorial.motorSkills}`,
        `${labels.neuro}: atencion=${data.neurodivergence.attention ? yesNo[0] : yesNo[1]}, hiperactividad=${data.neurodivergence.hyperactivity ? yesNo[0] : yesNo[1]}, social=${data.neurodivergence.socialInteraction ? yesNo[0] : yesNo[1]}, ansiedad=${data.neurodivergence.anxiety ? yesNo[0] : yesNo[1]}, sensorial=${data.neurodivergence.sensoryOverload ? yesNo[0] : yesNo[1]}`,
      ];
      if (data.neurodivergence.additionalNotes) overviewLines.push(labels.notes + " " + String(data.neurodivergence.additionalNotes).slice(0, 200));
      addBulletList(overviewLines);

      if (data.aiResponses.length > 0) {
        addSectionTitle(labels.convSummary);
        const lastResponses = data.aiResponses.slice(-3);
        const aiSummary = lastResponses.map((entry, i) => {
          const q = String(entry.question ?? "").slice(0, 120);
          const a = String(entry.answer ?? "").slice(0, 120);
          return reportLang === "es" ? `P${i + 1}: ${q} | R${i + 1}: ${a}` : `Q${i + 1}: ${q} | A${i + 1}: ${a}`;
        });
        addBulletList(aiSummary);
      }

      cursorY += 4;
      snapshot.report.forEach((section) => {
        addSectionTitle(section.title);
        addBulletList(section.content);
        cursorY += 2;
      });

      const subjectSectionTitle = reportLang === "kaqchikel" ? "Tz'ukul pa k'ojlib'al" : reportLang === "en" ? "Subject-specific strategies" : "Estrategias por materia";
      addSectionTitle(subjectSectionTitle);
      const subjectLabels: { key: keyof SubjectStrategiesStored; es: string; en: string; kaqchikel: string }[] = [
        { key: "numeracy", es: "Area numerica / Matematicas", en: "Numeracy / Mathematics", kaqchikel: "Ajilab'al" },
        { key: "language", es: "Lenguaje y lectoescritura", en: "Language and literacy", kaqchikel: "Tz'ib'axik" },
        { key: "foreignLanguage", es: "Aprendizaje de nuevo idioma", en: "New language learning", kaqchikel: "Ch'ab'al k'ak'a'" },
        { key: "arts", es: "Areas artisticas", en: "Arts", kaqchikel: "B'itz'ib'" },
        { key: "ict", es: "TIC", en: "ICT", kaqchikel: "TIC" },
        { key: "other", es: "Otros apoyos recomendados", en: "Other recommended supports", kaqchikel: "Juley chik" },
      ];
      const ss = snapshot.subjectStrategies;
      subjectLabels.forEach(({ key, es, en, kaqchikel }) => {
        const items = ss[key];
        if (!items || items.length === 0) return;
        const label = reportLang === "kaqchikel" ? kaqchikel : reportLang === "en" ? en : es;
        addSectionTitle(label);
        addBulletList(items);
      });

      cursorY += 4;
      addSectionTitle(labels.familyKaqchikel);
      const kaqchikelForPdf = snapshot.familySummaryKaqchikel.length >= 3 ? snapshot.familySummaryKaqchikel : ["Tz'etel ala' pa ruq'a' ruk'u'x, xa jun chi q'ij.", "Taqa' to'ob'al pa jay ruma ri ala'.", "Titzijonik pa tinamit chuqa' pa jay richin ri ala' nuk'am."];
      addBulletList(kaqchikelForPdf);

      cursorY += 6;
      maybeNewPage(15);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const footerLines = doc.splitTextToSize(labels.footer, maxWidth);
      footerLines.forEach((l: string) => {
        doc.text(l, marginLeft, cursorY);
        cursorY += lineHeight;
      });

      const safeName = studentName.replace(/\s+/g, "_").slice(0, 30);
      doc.save(`Informe_Evaluacion_${safeName}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF de evaluación:", err);
      alert(language === "es" ? "No se pudo generar el PDF." : "Could not generate PDF.");
    }
  };

  if (students.length === 0) {
    return (
      <div className="p-6 lg:p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t("progress.title")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("progress.subtitle")}
            </p>
          </header>
          <Card>
            <CardHeader>
              <CardTitle>{language === "es" ? "Sin estudiantes guardados" : "No students saved yet"}</CardTitle>
              <CardDescription>
                {language === "es"
                  ? "Completa una evaluación y guarda al estudiante para ver su seguimiento aquí."
                  : "Complete an assessment and save the student to track progress here."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/assessment">{language === "es" ? "Ir a Evaluación" : "Go to Assessment"}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t("progress.title")}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t("progress.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleDownloadAssessmentReport} disabled={!effectiveStudent || !savedSelected?.reportSnapshot?.report?.length}>
                <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                {language === "es" ? "Informe de evaluación (PDF)" : "Assessment report (PDF)"}
              </Button>
              <Button variant="outline" onClick={handleDownloadReport} disabled={!effectiveStudent}>
                <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                {language === "es" ? "Informe de seguimiento (PDF)" : "Progress report (PDF)"}
              </Button>
              <Button onClick={() => setQuickLogOpen(true)} disabled={!effectiveStudent}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("progress.quickLog")}
              </Button>
            </div>
          </div>
        </header>

        <StudentSelector
          students={students}
          selectedStudent={effectiveStudent}
          onSelectStudent={handleStudentChange}
        />

        {effectiveStudent && savedSelected && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/assessment?student=${effectiveStudent.id}`}>
                {t("progress.newAssessment")}
              </Link>
            </Button>
          </div>
        )}

        <Tabs defaultValue="overview" className="mt-8 space-y-0">
          <Card className="overflow-hidden">
            <div className="border-b bg-muted/30 px-2 pt-2 sm:px-4 overflow-x-auto">
              <TabsList className="h-11 w-max min-w-full grid grid-cols-5 gap-1 rounded-lg bg-transparent p-0 shadow-none sm:w-full">
                <TabsTrigger
                  value="overview"
                  className="flex items-center justify-center gap-2 rounded-md border-0 bg-transparent py-3 text-sm font-medium shadow-none transition-colors hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{language === "es" ? "Resumen" : "Overview"}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex items-center justify-center gap-2 rounded-md border-0 bg-transparent py-3 text-sm font-medium shadow-none transition-colors hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t("progress.timeline")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-3 text-xs font-medium shadow-none transition-colors hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-sm"
                >
                  <BarChart3 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t("progress.charts")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="flex items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-3 text-xs font-medium shadow-none transition-colors hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-sm"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t("progress.chatTab")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="report"
                  className="flex items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 py-3 text-xs font-medium shadow-none transition-colors hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-sm"
                >
                  <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t("progress.reportTab")}</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="p-4 sm:p-6">
          <TabsContent value="overview" className="mt-0 outline-none">
            <div className="grid gap-6 lg:grid-cols-2">
              {effectiveStudent && <ProgressChart student={effectiveStudent} />}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "es" ? "Resumen del Progreso" : "Progress Summary"}</CardTitle>
                  <CardDescription>
                    {t("progress.initialVsCurrent")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {effectiveStudent && (["social", "academic", "emotional"] as const).map((domain) => {
                      const initial = effectiveStudent.initialState[domain];
                      const current = effectiveStudent.currentProgress[domain];
                      const change = current - initial;
                      return (
                        <div key={domain}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium">{domainLabels[domain]}</span>
                            <span
                              className={`text-sm font-semibold ${
                                change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground"
                              }`}
                            >
                              {change > 0 ? "+" : ""}
                              {change}%
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <div className="mb-1 text-xs text-muted-foreground">{language === "es" ? "Inicial" : "Initial"}</div>
                              <div className="h-3 rounded-full bg-muted">
                                <div
                                  className="h-3 rounded-full bg-muted-foreground/50"
                                  style={{ width: `${initial}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="mb-1 text-xs text-muted-foreground">{language === "es" ? "Actual" : "Current"}</div>
                              <div className="h-3 rounded-full bg-muted">
                                <div
                                  className="h-3 rounded-full bg-primary"
                                  style={{ width: `${current}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0 outline-none">
            <ProgressTimeline entries={timeline} studentName={effectiveStudent?.name ?? ""} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 outline-none">
            <div className="grid gap-6 lg:grid-cols-2">
              {effectiveStudent && (
                <>
                  <ProgressChart student={effectiveStudent} type="radar" />
                  <ProgressChart student={effectiveStudent} type="bar" />
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-0 outline-none">
            {savedSelected ? (
              <StudentAgentPanel
                key={savedSelected.id}
                studentId={savedSelected.id}
                assessmentData={savedSelected.assessmentData}
                onFollowUpSent={(msg) => handleFollowUpSent(msg)}
                onFollowUpSaved={handleFollowUpSaved}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("progress.selectPrompt")}</p>
            )}
          </TabsContent>

          <TabsContent value="report" className="mt-0 outline-none">
            {savedSelected ? (
              <StudentReportView
                studentId={savedSelected.id}
                studentName={savedSelected.name}
                assessmentData={savedSelected.assessmentData}
                snapshot={savedSelected.reportSnapshot}
                onSnapshotUpdated={handleReportUpdated}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("progress.selectPrompt")}</p>
            )}
          </TabsContent>
            </div>
          </Card>
        </Tabs>

        <QuickLogDialog
          open={quickLogOpen}
          onOpenChange={setQuickLogOpen}
          studentName={effectiveStudent?.name ?? ""}
          onSubmit={handleAddLog}
        />
      </div>
  );
}

export default function ProgressPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8">
          <p className="text-muted-foreground">{t("progress.loadingChat")}</p>
        </div>
      }
    >
      <ProgressPageContent />
    </Suspense>
  );
}
