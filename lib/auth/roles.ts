export type UserRole = "admin" | "docente" | "estudiante";

export const USER_ROLES: UserRole[] = ["admin", "docente", "estudiante"];

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "admin" || value === "docente" || value === "estudiante";
}

export function getHomePathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "estudiante":
      return "/alumno";
    default:
      return "/dashboard";
  }
}

export function getRoleLabel(role: UserRole, language: "es" | "en" = "es"): string {
  const labels: Record<UserRole, { es: string; en: string }> = {
    admin: { es: "Administrador", en: "Administrator" },
    docente: { es: "Docente", en: "Teacher" },
    estudiante: { es: "Estudiante", en: "Student" },
  };
  return labels[role][language];
}

export function parseRoleFromMetadata(metadata: Record<string, unknown> | undefined): UserRole {
  const role = metadata?.role;
  return typeof role === "string" && isUserRole(role) ? role : "docente";
}
