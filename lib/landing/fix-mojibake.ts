/**
 * Repara texto UTF-8 que quedó guardado como Latin-1 (p. ej. "EducaciÃ³n" → "Educación").
 */
export function fixUtf8Mojibake(value: string): string {
  if (!value || !value.includes("Ã")) return value;
  try {
    const fixed = Buffer.from(value, "latin1").toString("utf8");
    if (fixed.includes("\uFFFD")) return value;
    return fixed;
  } catch {
    return value;
  }
}

export function fixUtf8MojibakeFields<T extends Record<string, unknown>>(
  record: T,
  keys: readonly (keyof T)[]
): T {
  const out = { ...record };
  for (const key of keys) {
    const v = out[key];
    if (typeof v === "string") {
      (out as Record<string, unknown>)[key as string] = fixUtf8Mojibake(v);
    }
  }
  return out;
}
