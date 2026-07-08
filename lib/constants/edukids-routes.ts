/** Rutas públicas de la landing EduKids (activas en modo mantenimiento parcial). */
export const EDUKIDS_PUBLIC_PATHS = new Set([
  "/",
  "/servicios",
  "/galeria",
  "/preguntas-frecuentes",
  "/comunicate-con-nosotros",
  "/portafolio",
  "/pestana",
]);

export function normalizePathname(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function isEdukidsPublicPath(path: string): boolean {
  const normalized = normalizePathname(path);
  if (EDUKIDS_PUBLIC_PATHS.has(normalized)) return true;
  if (path.startsWith("/api/public/")) return true;
  if (path === "/api/contact") return true;
  return false;
}

/** Rutas activas mientras EDUGUIA/campus/docente están pausados. */
export function isAllowedWhileEduguiaPaused(path: string): boolean {
  if (isEdukidsPublicPath(path)) return true;

  const normalized = normalizePathname(path);

  if (path.startsWith("/auth/")) return true;
  if (normalized === "/campus/login" || normalized === "/campus/register") return true;
  if (normalized === "/acceso") return true;

  if (normalized === "/admin" || normalized.startsWith("/admin/")) return true;
  if (path.startsWith("/api/admin/")) return true;

  return false;
}
