const CAMPUS_EMAIL_DOMAIN = "campus.edukids.local";

export function normalizeCampusUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ".");
}

export function isValidCampusUsername(username: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(username);
}

export function campusUsernameToEmail(username: string): string {
  return `${normalizeCampusUsername(username)}@${CAMPUS_EMAIL_DOMAIN}`;
}

/** Acepta usuario corto o correo completo (compatibilidad). */
export function resolveCampusLoginEmail(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  return campusUsernameToEmail(trimmed);
}
