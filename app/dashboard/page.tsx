"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardList,
  Heart,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useStudents } from "@/contexts/students-context";
import { useTeacherProfile } from "@/contexts/teacher-profile-context";
import {
  formatRelativeDays,
  getFollowUpReminders,
  getLastStudentActivityDate,
  daysSince,
} from "@/lib/student-reminders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { students, refreshFromSupabase } = useStudents();
  const { profile } = useTeacherProfile();
  const [search, setSearch] = useState("");

  useEffect(() => {
    void refreshFromSupabase();
  }, [refreshFromSupabase]);

  const reminders = useMemo(() => getFollowUpReminders(students, 14), [students]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = [...students].sort(
      (a, b) => getLastStudentActivityDate(b).getTime() - getLastStudentActivityDate(a).getTime()
    );
    if (!query) return list;
    return list.filter((s) => s.name.toLowerCase().includes(query));
  }, [students, search]);

  const assessmentsThisMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return students.filter((s) => {
      const d = new Date(s.completedAt);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  }, [students]);

  const withReports = students.filter((s) => (s.reportSnapshot?.report?.length ?? 0) > 0).length;

  const quickStats = [
    { label: t("dashboard.totalStudents"), value: String(students.length), icon: Users, color: "text-primary" },
    {
      label: t("dashboard.assessmentsThisMonth"),
      value: String(assessmentsThisMonth),
      icon: ClipboardList,
      color: "text-secondary",
    },
    {
      label: t("dashboard.withReports"),
      value: String(withReports),
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      label: t("dashboard.pendingFollowUp"),
      value: String(reminders.length),
      icon: AlertTriangle,
      color: "text-warning",
    },
  ];

  const welcomeName = profile?.nombre?.trim() || t("dashboard.welcomeGeneric");

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("dashboard.welcome")}, {welcomeName}. {t("dashboard.overview")}
        </p>
      </header>

      {reminders.length > 0 && (
        <section aria-labelledby="reminders-heading" className="mb-8">
          <h2 id="reminders-heading" className="sr-only">
            {t("dashboard.remindersTitle")}
          </h2>
          <Alert className="border-amber-500/40 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <AlertTitle>{t("dashboard.remindersTitle")}</AlertTitle>
            <AlertDescription>
              <ul className="mt-3 space-y-2" role="list">
                {reminders.slice(0, 5).map((reminder) => (
                  <li key={reminder.studentId} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {language === "es"
                        ? `Hace ${reminder.daysSinceUpdate} días que no actualizas el seguimiento de ${reminder.studentName}.`
                        : `It has been ${reminder.daysSinceUpdate} days since you updated follow-up for ${reminder.studentName}.`}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/progress?student=${reminder.studentId}`}>
                        {t("dashboard.updateFollowUp")}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
              {reminders.length > 5 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("dashboard.moreReminders").replace("{count}", String(reminders.length - 5))}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </section>
      )}

      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">
          {t("dashboard.statsHeading")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="actions-heading" className="mb-8">
        <h2 id="actions-heading" className="mb-4 text-xl font-semibold">
          {t("dashboard.quickActions")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <CardTitle className="mt-4">{t("dashboard.newAssessment")}</CardTitle>
              <CardDescription>{t("dashboard.newAssessmentDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/assessment">
                  {t("dashboard.start")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-secondary/5 transition-colors hover:bg-secondary/10">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <TrendingUp className="h-6 w-6 text-secondary-foreground" aria-hidden="true" />
              </div>
              <CardTitle className="mt-4">{t("dashboard.viewProgress")}</CardTitle>
              <CardDescription>{t("dashboard.viewProgressDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/dashboard/progress">
                  {t("dashboard.view")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5 transition-colors hover:bg-destructive/10">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive">
                <Heart className="h-6 w-6 text-destructive-foreground" aria-hidden="true" />
              </div>
              <CardTitle className="mt-4">{t("dashboard.inclusionToolkit")}</CardTitle>
              <CardDescription>{t("dashboard.inclusionToolkitDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="destructive" className="w-full">
                <Link href="/dashboard/toolkit">
                  {t("dashboard.open")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="students-heading">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="students-heading" className="text-xl font-semibold">
              {t("dashboard.studentList")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("dashboard.studentListDesc")}</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("dashboard.searchStudents")}
              className="pl-9"
              aria-label={t("dashboard.searchStudents")}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>{search.trim() ? t("dashboard.noSearchResults") : t("dashboard.noStudents")}</p>
                {!search.trim() && (
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/assessment">{t("dashboard.startFirstAssessment")}</Link>
                  </Button>
                )}
              </div>
            ) : (
              <ul role="list" className="divide-y divide-border">
                {filteredStudents.map((student) => {
                  const lastActivity = getLastStudentActivityDate(student);
                  const inactiveDays = daysSince(lastActivity);
                  const needsReminder = inactiveDays >= 14;
                  const hasReport = (student.reportSnapshot?.report?.length ?? 0) > 0;

                  return (
                    <li key={student.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{student.name}</p>
                            {student.age && (
                              <Badge variant="secondary">{student.age} {language === "es" ? "años" : "y/o"}</Badge>
                            )}
                            {needsReminder && (
                              <Badge variant="outline" className="border-amber-500 text-amber-700">
                                {t("dashboard.needsFollowUp")}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("dashboard.lastActivity")}: {formatRelativeDays(inactiveDays, language)}
                          </p>
                          {hasReport && (
                            <p className="text-xs text-muted-foreground">{t("dashboard.hasReport")}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/assessment?student=${student.id}`}>
                            {t("dashboard.openAssessment")}
                          </Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/dashboard/progress?student=${student.id}`}>
                            {t("dashboard.openProgress")}
                          </Link>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
