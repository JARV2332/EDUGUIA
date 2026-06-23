"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { ReportSnapshot } from "@/lib/student-store";
import { AppShell } from "@/components/app-shell";
import { useStudents } from "@/contexts/students-context";
import { useLanguage } from "@/contexts/language-context";
import { AssessmentStepper } from "@/components/assessment/assessment-stepper";
import { SensorialPhysicalForm } from "@/components/assessment/sensorial-physical-form";
import { NeurodivergenceBehaviorForm } from "@/components/assessment/neurodivergence-behavior-form";
import { AIAdaptiveTest } from "@/components/assessment/ai-adaptive-test";
import { AssessmentResults } from "@/components/assessment/assessment-results";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface AssessmentData {
  studentName: string;
  studentAge: string;
  sensorial: {
    visualImpairment: string;
    hearingImpairment: string;
    motorSkills: string;
    assistiveTech: string[];
  };
  neurodivergence: {
    attention: boolean;
    hyperactivity: boolean;
    socialInteraction: boolean;
    anxiety: boolean;
    sensoryOverload: boolean;
    additionalNotes: string;
  };
  aiResponses: Array<{ question: string; answer: string }>;
}

const initialData: AssessmentData = {
  studentName: "",
  studentAge: "",
  sensorial: {
    visualImpairment: "none",
    hearingImpairment: "none",
    motorSkills: "typical",
    assistiveTech: [],
  },
  neurodivergence: {
    attention: false,
    hyperactivity: false,
    socialInteraction: false,
    anxiety: false,
    sensoryOverload: false,
    additionalNotes: "",
  },
  aiResponses: [],
};

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<AssessmentData>(initialData);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [reportSnapshot, setReportSnapshot] = useState<ReportSnapshot | null>(null);
  const { t } = useLanguage();
  const { addStudent } = useStudents();
  const handleReportSnapshotChange = useCallback((snapshot: ReportSnapshot) => setReportSnapshot(snapshot), []);

  const steps = [
    { id: 1, name: t("assessment.step1"), description: "Basic information" },
    { id: 2, name: t("assessment.step2"), description: "Physical assessments" },
    { id: 3, name: t("assessment.step3"), description: "Behavioral indicators" },
    { id: 4, name: t("assessment.step4"), description: "Interactive evaluation" },
    { id: 5, name: t("assessment.step5"), description: "Assessment report" },
  ];

  const updateData = (updates: Partial<AssessmentData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return data.studentName.trim() !== "" && data.studentAge.trim() !== "";
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{t("studentInfo.title")}</CardTitle>
              <CardDescription>
                {t("assessment.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="student-name">{t("studentInfo.fullName")}</Label>
                <Input
                  id="student-name"
                  placeholder={t("studentInfo.fullNamePlaceholder")}
                  value={data.studentName}
                  onChange={(e) => updateData({ studentName: e.target.value })}
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-age">{t("studentInfo.dateOfBirth")}</Label>
                <Input
                  id="student-age"
                  type="number"
                  placeholder="Age"
                  value={data.studentAge}
                  onChange={(e) => updateData({ studentAge: e.target.value })}
                  min="3"
                  max="25"
                  aria-required="true"
                />
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return <SensorialPhysicalForm data={data} updateData={updateData} />;
      case 3:
        return <NeurodivergenceBehaviorForm data={data} updateData={updateData} />;
      case 4:
        return <AIAdaptiveTest data={data} updateData={updateData} onComplete={nextStep} />;
      case 5:
        return (
          <AssessmentResults
            data={data}
            onReportSnapshotChange={handleReportSnapshotChange}
            onPdfExported={async (snapshot) => {
              if (!savedId) {
                await addStudent(data, snapshot);
                setSavedId("ok");
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppShell>
      <div className={currentStep === 4 ? "min-w-0 overflow-x-hidden p-3 sm:p-6 lg:p-8" : "p-6 lg:p-8"}>
        <header className={currentStep === 4 ? "mb-4 sm:mb-6" : "mb-8"}>
          <h1 className={currentStep === 4 ? "text-xl font-bold tracking-tight text-foreground sm:text-3xl" : "text-3xl font-bold tracking-tight text-foreground"}>
            {t("assessment.title")}
          </h1>
          {currentStep !== 4 && (
            <p className="mt-2 text-muted-foreground">{t("assessment.subtitle")}</p>
          )}
        </header>

        <AssessmentStepper steps={steps} currentStep={currentStep} />

        <div className={currentStep === 4 ? "mt-4 min-w-0 sm:mt-8" : "mt-8"}>{renderStepContent()}</div>

        {currentStep !== 4 && currentStep !== 5 && (
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              aria-label={t("assessment.previous")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("assessment.previous")}
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              aria-label={t("assessment.next")}
            >
              {t("assessment.next")}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {savedId ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                {t("common.success")}: {data.studentName}.{" "}
                <Link href="/progress" className="underline font-medium">
                  {t("results.viewProgress")}
                </Link>
              </p>
            ) : (
              <Button
                onClick={async () => {
                  await addStudent(data, reportSnapshot ?? undefined);
                  setSavedId("ok");
                }}
              >
                {t("results.saveStudentAndViewProgress")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(1);
                setData(initialData);
                setSavedId(null);
              }}
            >
              {t("results.startNew")}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
