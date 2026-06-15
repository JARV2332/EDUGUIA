import type { SavedStudent } from "@/lib/student-store";

export interface FollowUpReminder {
  studentId: string;
  studentName: string;
  daysSinceUpdate: number;
  lastActivity: Date;
}

export function getLastStudentActivityDate(student: SavedStudent): Date {
  const dates: Date[] = [];

  if (student.completedAt) {
    const d = new Date(student.completedAt);
    if (!Number.isNaN(d.getTime())) dates.push(d);
  }

  for (const entry of student.timeline ?? []) {
    if (entry.date) {
      const d = new Date(entry.date);
      if (!Number.isNaN(d.getTime())) dates.push(d);
    }
  }

  for (const entry of student.assessmentData.followUpLog ?? []) {
    if (entry.at) {
      const d = new Date(entry.at);
      if (!Number.isNaN(d.getTime())) dates.push(d);
    }
  }

  if (dates.length === 0) return new Date();

  return dates.reduce((latest, current) => (current > latest ? current : latest));
}

export function daysSince(date: Date): number {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFollowUpReminders(
  students: SavedStudent[],
  thresholdDays = 14
): FollowUpReminder[] {
  return students
    .map((student) => {
      const lastActivity = getLastStudentActivityDate(student);
      const daysSinceUpdate = daysSince(lastActivity);
      return {
        studentId: student.id,
        studentName: student.name,
        daysSinceUpdate,
        lastActivity,
      };
    })
    .filter((item) => item.daysSinceUpdate >= thresholdDays)
    .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

export function formatRelativeDays(days: number, language: "es" | "en"): string {
  if (days === 0) return language === "es" ? "hoy" : "today";
  if (days === 1) return language === "es" ? "hace 1 día" : "1 day ago";
  return language === "es" ? `hace ${days} días` : `${days} days ago`;
}
