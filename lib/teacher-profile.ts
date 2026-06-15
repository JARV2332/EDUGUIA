export interface TeacherProfile {
  id: string;
  nombre: string;
  escuela: string;
  avatar_url: string | null;
  email?: string;
}

export interface TeacherProfilePdf {
  nombre?: string | null;
  escuela?: string | null;
}

export function toTeacherProfilePdf(profile: TeacherProfile | null | undefined): TeacherProfilePdf | undefined {
  if (!profile) return undefined;
  if (!profile.nombre?.trim() && !profile.escuela?.trim()) return undefined;
  return {
    nombre: profile.nombre?.trim() || null,
    escuela: profile.escuela?.trim() || null,
  };
}

export function getTeacherPdfLines(
  profile: TeacherProfilePdf | null | undefined,
  isEs: boolean
): string[] {
  const lines: string[] = [];
  if (profile?.nombre?.trim()) {
    lines.push(`${isEs ? "Docente" : "Teacher"}: ${profile.nombre.trim()}`);
  }
  if (profile?.escuela?.trim()) {
    lines.push(`${isEs ? "Centro educativo" : "School"}: ${profile.escuela.trim()}`);
  }
  return lines;
}
