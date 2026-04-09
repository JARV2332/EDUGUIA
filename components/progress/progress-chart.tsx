"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { Student } from "@/app/progress/page";

interface ProgressChartProps {
  student: Student;
  type?: "radar" | "bar";
}

export function ProgressChart({ student, type = "radar" }: ProgressChartProps) {
  const radarData = [
    {
      domain: "Social",
      initial: student.initialState.social,
      current: student.currentProgress.social,
      fullMark: 100,
    },
    {
      domain: "Academic",
      initial: student.initialState.academic,
      current: student.currentProgress.academic,
      fullMark: 100,
    },
    {
      domain: "Emotional",
      initial: student.initialState.emotional,
      current: student.currentProgress.emotional,
      fullMark: 100,
    },
  ];

  const barData = [
    {
      name: "Social",
      Initial: student.initialState.social,
      Current: student.currentProgress.social,
    },
    {
      name: "Academic",
      Initial: student.initialState.academic,
      Current: student.currentProgress.academic,
    },
    {
      name: "Emotional",
      Initial: student.initialState.emotional,
      Current: student.currentProgress.emotional,
    },
  ];

  if (type === "bar") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Comparison</CardTitle>
          <CardDescription>
            Initial state vs current progress across all domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]" role="img" aria-label={`Bar chart showing ${student.name}'s progress comparison`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                <YAxis domain={[0, 100]} className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Bar dataKey="Initial" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Radar</CardTitle>
        <CardDescription>
          Visual comparison of {student.name}&apos;s development across domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" role="img" aria-label={`Radar chart showing ${student.name}'s progress`}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis
                dataKey="domain"
                className="text-xs fill-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                className="text-xs fill-muted-foreground"
              />
              <Radar
                name="Initial State"
                dataKey="initial"
                stroke="hsl(var(--muted-foreground))"
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.2}
              />
              <Radar
                name="Current Progress"
                dataKey="current"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
