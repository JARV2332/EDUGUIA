/** Roles del campus virtual EduKids (LMS) — separado de EDUGUIA */
export type LmsRole = "admin" | "lms_docente" | "estudiante";

export function isLmsRole(value: string | null | undefined): value is LmsRole {
  return value === "admin" || value === "lms_docente" || value === "estudiante";
}

export function getCampusHomeForRole(role: LmsRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "estudiante":
      return "/alumno";
    case "lms_docente":
      return "/campus/docente";
  }
}

export function getLmsRoleLabel(role: LmsRole, language: "es" | "en" = "es"): string {
  const labels: Record<LmsRole, { es: string; en: string }> = {
    admin: { es: "Administrador", en: "Administrator" },
    lms_docente: { es: "Docente EduKids", en: "EduKids Teacher" },
    estudiante: { es: "Estudiante", en: "Student" },
  };
  return labels[role][language];
}
