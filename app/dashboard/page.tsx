"use client";

import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Users,
  Brain,
  Heart,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const recentStudents = [
  { id: 1, name: "Alex Johnson", lastAssessment: "2 days ago", lastAssessmentEs: "hace 2 dias", progress: 75 },
  { id: 2, name: "Maria Garcia", lastAssessment: "1 week ago", lastAssessmentEs: "hace 1 semana", progress: 60 },
  { id: 3, name: "James Wilson", lastAssessment: "3 days ago", lastAssessmentEs: "hace 3 dias", progress: 45 },
];

export default function DashboardPage() {
  const { t, language } = useLanguage();

  const quickStats = [
    { label: t("dashboard.totalStudents"), value: "24", icon: Users, color: "text-primary" },
    { label: t("dashboard.assessmentsThisMonth"), value: "18", icon: ClipboardList, color: "text-secondary" },
    { label: t("dashboard.avgProgress"), value: "68%", icon: TrendingUp, color: "text-accent" },
    { label: t("dashboard.activeIEPs"), value: "12", icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("dashboard.welcome")}. {t("dashboard.overview")}
        </p>
      </header>

      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">Quick Statistics</h2>
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
        <h2 id="actions-heading" className="mb-4 text-xl font-semibold">{t("dashboard.quickActions")}</h2>
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
        <div className="mb-4 flex items-center justify-between">
          <h2 id="students-heading" className="text-xl font-semibold">{t("dashboard.recentStudents")}</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/progress">{t("dashboard.viewAll")}</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <ul role="list" className="divide-y divide-border">
              {recentStudents.map((student) => (
                <li key={student.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("dashboard.lastAssessment")}: {language === "es" ? student.lastAssessmentEs : student.lastAssessment}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">{t("nav.progress")}</span>
                        <span className="font-medium">{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" aria-label={`${student.name} progress: ${student.progress}%`} />
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/progress?student=${student.id}`}>
                        {t("dashboard.view")}
                        <span className="sr-only">{student.name}</span>
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
