import type { ReportSnapshot } from "@/lib/student-store";

export type SharedReportPayload = {
  studentName: string;
  reportSnapshot: ReportSnapshot;
  expiresAt: string;
  createdAt: string;
};

export function buildShareUrl(token: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/share/${token}`;
}

/** Nombre visible para familias (solo primer nombre). */
export function familyDisplayName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0];
  return first || "Estudiante";
}
