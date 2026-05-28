import type {
  AssessmentData,
  ReportLanguageStored,
  ReportSnapshot,
  ReportSectionStored,
  SubjectStrategiesStored,
} from "@/lib/student-store";

export interface AIResultsResponse {
  classroom_strategy?: string[];
  home_plan?: string[];
  professional_referrals?: string[];
  subject_strategies?: {
    numeracy?: string[];
    language?: string[];
    foreign_language?: string[];
    arts?: string[];
    ict?: string[];
    other?: string[];
  };
  family_summary_kaqchikel?: string[];
}

const SECTION_TITLES = {
  classroom: { es: "Estrategia de Aula", en: "Classroom Strategy", kaqchikel: "Tz'ukul pa tinamit" },
  home: { es: "Plan para el Hogar", en: "Home Plan", kaqchikel: "Tz'ukul pa jay" },
  referrals: { es: "Referencias Profesionales", en: "Professional Referrals", kaqchikel: "K'utunikil k'wajinel" },
} as const;

export function buildConversationSummary(
  data: AssessmentData,
  language: "es" | "en"
): string {
  const parts: string[] = [];

  if (data.aiResponses.length > 0) {
    parts.push(
      language === "es" ? "=== Evaluación adaptativa ===" : "=== Adaptive assessment ===",
      ...data.aiResponses.map(
        (item, index) =>
          `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`
      )
    );
  }

  const followUp = data.followUpLog ?? [];
  if (followUp.length > 0) {
    parts.push(
      language === "es" ? "=== Seguimiento posterior ===" : "=== Follow-up ===",
      ...followUp.map(
        (entry, index) =>
          `Seguimiento ${index + 1} (${entry.at}):\nDocente: ${entry.user}\nEduGuIA: ${entry.assistant}`
      )
    );
  }

  if (parts.length === 0) {
    return language === "es"
      ? "No hay conversación registrada aún."
      : "No conversation recorded yet.";
  }

  return parts.join("\n\n");
}

export function buildReportGenerationPrompt(
  data: AssessmentData,
  reportLanguage: ReportLanguageStored,
  language: "es" | "en"
): string {
  const name = data.studentName || (language === "es" ? "el estudiante" : "the student");
  const age = data.studentAge || (language === "es" ? "no especificada" : "not specified");

  const sensorialSummary = `
Visual: ${data.sensorial.visualImpairment}
Hearing: ${data.sensorial.hearingImpairment}
Motor skills: ${data.sensorial.motorSkills}
Assistive tech: ${data.sensorial.assistiveTech.join(", ") || "none reported"}
`.trim();

  const neuroSummary = `
Attention: ${data.neurodivergence.attention}
Hyperactivity: ${data.neurodivergence.hyperactivity}
Social interaction: ${data.neurodivergence.socialInteraction}
Anxiety: ${data.neurodivergence.anxiety}
Sensory overload: ${data.neurodivergence.sensoryOverload}
Notes: ${data.neurodivergence.additionalNotes || "none"}
`.trim();

  const conversationSummary = buildConversationSummary(data, language);

  const reportLangInstruction =
    reportLanguage === "kaqchikel"
      ? "Escribe TODOS los textos del informe EN KAQCHIKEL (maya de Guatemala), vocabulario claro para familias."
      : reportLanguage === "en"
        ? "Write ALL report texts IN ENGLISH, clear for families and teachers."
        : "Escribe TODOS los textos del informe EN ESPAÑOL claro para familias y docentes.";

  return `
Datos del estudiante:
- Nombre: ${name}
- Edad: ${age}

Perfil sensorial y físico:
${sensorialSummary}

Indicadores de neurodivergencia:
${neuroSummary}

Historial COMPLETO de conversación con EduGuIA (evaluación + seguimiento):
${conversationSummary}

Genera un INFORME FINAL DE SEGUIMIENTO que integre evaluación inicial y todo el seguimiento posterior.
Incluye:
1) Estrategias de AULA (DUA, Guatemala).
2) Plan para el HOGAR.
3) Derivaciones profesionales si aplica (sin diagnósticos clínicos).
4) Estrategias por materia: numeracy, language, foreign_language, arts, ict, other.
5) Exactamente 3 consejos en Kaqchikel en family_summary_kaqchikel.

NO diagnostiques. ${reportLangInstruction}

Devuelve ÚNICAMENTE un objeto JSON válido (sin markdown) con esta estructura:
{
  "classroom_strategy": ["..."],
  "home_plan": ["..."],
  "professional_referrals": ["..."],
  "subject_strategies": {
    "numeracy": ["..."],
    "language": ["..."],
    "foreign_language": ["..."],
    "arts": ["..."],
    "ict": ["..."],
    "other": ["..."]
  },
  "family_summary_kaqchikel": ["...", "...", "..."]
}
`.trim();
}

export function parseAIResultsJson(raw: string): AIResultsResponse | null {
  try {
    return JSON.parse(raw) as AIResultsResponse;
  } catch {
    const match = raw.match(/\{[\s\S]*\}$/m);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as AIResultsResponse;
    } catch {
      return null;
    }
  }
}

export function aiResultsToReportSnapshot(
  ai: AIResultsResponse,
  reportLanguage: ReportLanguageStored
): ReportSnapshot {
  const lang = reportLanguage;
  const titles = SECTION_TITLES;

  const classroom =
    ai.classroom_strategy?.length
      ? ai.classroom_strategy
      : [lang === "en" ? "Continue differentiated classroom supports." : "Continuar apoyos diferenciados en el aula."];

  const home =
    ai.home_plan?.length
      ? ai.home_plan
      : [lang === "en" ? "Provide emotional support at home." : "Brindar apoyo emocional en el hogar."];

  const referrals =
    ai.professional_referrals?.length
      ? ai.professional_referrals
      : [
          lang === "en"
            ? "Continue observing and documenting; no specific referral at this time."
            : "Continuar observando y documentando; sin derivación específica por ahora.",
        ];

  const subj = ai.subject_strategies ?? {};
  const subjectStrategies: SubjectStrategiesStored = {
    numeracy: subj.numeracy ?? [],
    language: subj.language ?? [],
    foreignLanguage: subj.foreign_language ?? [],
    arts: subj.arts ?? [],
    ict: subj.ict ?? [],
    other: subj.other ?? [],
  };

  const familySummaryKaqchikel =
    ai.family_summary_kaqchikel && ai.family_summary_kaqchikel.length >= 3
      ? ai.family_summary_kaqchikel.slice(0, 3)
      : [
          "Tz'etel ala' pa ruq'a' ruk'u'x, xa jun chi q'ij.",
          "Taqa' to'ob'äl pa jay ruma ri ala'.",
          "Titzijonïk pa tinamit chuqa' pa jay richin ri ala' nuk'äm.",
        ];

  const report: ReportSectionStored[] = [
    {
      id: "classroom",
      title: titles.classroom[lang === "kaqchikel" ? "kaqchikel" : lang === "en" ? "en" : "es"],
      content: classroom,
      priority: classroom.length > 3 ? "high" : "medium",
    },
    {
      id: "home",
      title: titles.home[lang === "kaqchikel" ? "kaqchikel" : lang === "en" ? "en" : "es"],
      content: home,
      priority: home.length > 3 ? "high" : "medium",
    },
    {
      id: "referrals",
      title: titles.referrals[lang === "kaqchikel" ? "kaqchikel" : lang === "en" ? "en" : "es"],
      content: referrals,
      priority: referrals.length > 2 ? "high" : "low",
    },
  ];

  return {
    report,
    subjectStrategies,
    familySummaryKaqchikel,
    reportLanguage: lang,
  };
}
