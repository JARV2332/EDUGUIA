import { parseAIResultsJson, type AIResultsResponse } from "@/lib/generate-report";

const SUBJECT_LABELS_ES: Record<string, string> = {
  numeracy: "Área numérica",
  language: "Lenguaje",
  foreign_language: "Nuevo idioma",
  arts: "Artes",
  ict: "TIC",
  other: "Otros apoyos",
};

const SUBJECT_LABELS_EN: Record<string, string> = {
  numeracy: "Numeracy",
  language: "Language",
  foreign_language: "New language",
  arts: "Arts",
  ict: "ICT",
  other: "Other supports",
};

function reportJsonToMarkdown(ai: AIResultsResponse, language: "es" | "en"): string {
  const lines: string[] = [];
  const isEs = language === "es";

  lines.push(isEs ? "**Resumen de estrategias (informe)**" : "**Strategy summary (report)**");

  if (ai.classroom_strategy?.length) {
    lines.push("", isEs ? "**Estrategias de aula**" : "**Classroom strategies**");
    ai.classroom_strategy.forEach((item) => lines.push(`- ${item}`));
  }

  if (ai.home_plan?.length) {
    lines.push("", isEs ? "**Plan para el hogar**" : "**Home plan**");
    ai.home_plan.forEach((item) => lines.push(`- ${item}`));
  }

  if (ai.professional_referrals?.length) {
    lines.push("", isEs ? "**Referencias profesionales**" : "**Professional referrals**");
    ai.professional_referrals.forEach((item) => lines.push(`- ${item}`));
  }

  const subj = ai.subject_strategies;
  if (subj && typeof subj === "object") {
    const labels = isEs ? SUBJECT_LABELS_ES : SUBJECT_LABELS_EN;
    for (const [key, items] of Object.entries(subj)) {
      if (!Array.isArray(items) || items.length === 0) continue;
      lines.push("", `**${labels[key] ?? key}**`);
      items.forEach((item) => lines.push(`- ${item}`));
    }
  }

  if (ai.family_summary_kaqchikel?.length) {
    lines.push("", isEs ? "**Apoyo para la familia (Kaqchikel)**" : "**Family support (Kaqchikel)**");
    ai.family_summary_kaqchikel.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join("\n").trim();
}

/** Convierte respuestas JSON de informe en texto legible para el chat. */
export function formatAssistantChatContent(content: string, language: "es" | "en" = "es"): string {
  const trimmed = content.trim();
  if (!trimmed) return content;

  const direct = parseAIResultsJson(trimmed);
  if (direct?.classroom_strategy || direct?.home_plan) {
    return reportJsonToMarkdown(direct, language);
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*"classroom_strategy"[\s\S]*\}\s*$/);
  if (jsonMatch) {
    const parsed = parseAIResultsJson(jsonMatch[0]);
    if (parsed) {
      const before = trimmed.slice(0, jsonMatch.index).trim();
      const formatted = reportJsonToMarkdown(parsed, language);
      return before ? `${before}\n\n${formatted}` : formatted;
    }
  }

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const parsed = parseAIResultsJson(trimmed);
    if (parsed && (parsed.home_plan || parsed.subject_strategies)) {
      return reportJsonToMarkdown(parsed, language);
    }
  }

  return content;
}
