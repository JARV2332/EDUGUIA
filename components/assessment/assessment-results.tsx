"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { useAccessibility } from "@/contexts/accessibility-context";
import { useLanguage } from "@/contexts/language-context";
import { useTeacherProfile } from "@/contexts/teacher-profile-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  School,
  Home,
  Stethoscope,
  Volume2,
  VolumeX,
  FileDown,
  Printer,
  CheckCircle2,
} from "lucide-react";
import type { AssessmentData } from "@/app/assessment/page";
import type { ReportSnapshot } from "@/lib/student-store";
import { getTeacherPdfLines, toTeacherProfilePdf } from "@/lib/teacher-profile";

interface AssessmentResultsProps {
  data: AssessmentData;
  /** Se llama cuando el informe está listo para guardar (para Progreso). */
  onReportSnapshotChange?: (snapshot: ReportSnapshot) => void;
  /** Se llama al exportar el PDF para guardar estudiante e informe si aún no se ha guardado. */
  onPdfExported?: (snapshot: ReportSnapshot) => void;
  /** ID del estudiante en Supabase; si se envía, se guarda el plan en planes_intervencion */
  estudianteId?: string | null;
}

interface ReportSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string[];
  priority: "high" | "medium" | "low";
}

interface SubjectStrategies {
  numeracy: string[];
  language: string[];
  foreignLanguage: string[];
  arts: string[];
  ict: string[];
  other: string[];
}

type ReportLanguage = "es" | "en" | "kaqchikel";

function ReadAloudButton({ text, sectionTitle }: { text: string; sectionTitle: string }) {
  const { speakText, stopSpeaking, isSpeaking } = useAccessibility();
  const { t } = useLanguage();

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(`${sectionTitle}. ${text}`);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      aria-label={isSpeaking ? t("results.stop") : `${t("results.readAloud")} ${sectionTitle}`}
    >
      {isSpeaking ? (
        <VolumeX className="mr-2 h-4 w-4" />
      ) : (
        <Volume2 className="mr-2 h-4 w-4" />
      )}
      {isSpeaking ? t("results.stop") : t("results.readAloud")}
    </Button>
  );
}

const PDF_LABELS = {
  es: {
    student: "Alumno",
    profile: "Perfil general del alumno",
    age: "Edad (dato ingresado)",
    ageNotSpec: "no especificada",
    sensorial: "Sensorial y físico",
    neuro: "Neurodivergencia",
    notes: "Notas adicionales",
    convSummary: "Resumen de la conversación con IA",
    familyKaqchikel: "Resumen para la familia en Kaqchikel",
    footer: "Este informe es una orientación basada en los datos recopilados y el análisis asistido por IA. No constituye un diagnóstico clínico.",
  },
  en: {
    student: "Student",
    profile: "General student profile",
    age: "Age (entered)",
    ageNotSpec: "not specified",
    sensorial: "Sensorial/physical",
    neuro: "Neurodivergence",
    notes: "Additional notes",
    convSummary: "Summary of AI conversation",
    familyKaqchikel: "Resumen para la familia en Kaqchikel",
    footer: "This report is guidance based on collected data and AI-assisted analysis. It does not constitute a clinical diagnosis.",
  },
  kaqchikel: {
    student: "Ri ala'",
    profile: "Ri ruk'wajinem ri ala'",
    age: "Rujunaab' (k'utunikil)",
    ageNotSpec: "man k'utun ta",
    sensorial: "Sik'inem chuqa' no'j",
    neuro: "Ri ruk'u'x chuqa' ri sik'inem",
    notes: "Juley chik tz'ib'axik",
    convSummary: "Rutz'ib'axik k'amol pa IA",
    familyKaqchikel: "Rutz'ib'axik richin ri ajay chi Kaqchikel",
    footer: "Re rutz'ib'axik re' jun to'ob'al ruma ri k'utunikil chuqa' ri IA. Man jun k'ak'a' tz'etem ta.",
  },
} as const;

export function AssessmentResults({ data, onReportSnapshotChange, onPdfExported, estudianteId }: AssessmentResultsProps) {
  const { t, language } = useLanguage();
  const { profile } = useTeacherProfile();
  const teacherPdf = toTeacherProfilePdf(profile);

  const generateReport = (reportLang: ReportLanguage = "es"): ReportSection[] => {
    const sections: ReportSection[] = [];
    const useKaq = reportLang === "kaqchikel";
    const classroomStrategies: string[] = [];

    if (data.sensorial.visualImpairment !== "none") {
      classroomStrategies.push(
        language === "es"
          ? "Proporcionar materiales en letra grande o formatos digitales accesibles"
          : "Provide materials in large print or accessible digital formats"
      );
      classroomStrategies.push(
        language === "es"
          ? "Asegurar asiento preferencial cerca del frente del aula"
          : "Ensure preferential seating near the front of the classroom"
      );
    }

    if (data.sensorial.hearingImpairment !== "none") {
      classroomStrategies.push(
        language === "es"
          ? "Usar senales visuales e instrucciones escritas junto con comunicacion verbal"
          : "Use visual cues and written instructions alongside verbal communication"
      );
    }

    if (data.neurodivergence.attention) {
      classroomStrategies.push(
        language === "es"
          ? "Dividir tareas en partes mas pequenas y manejables con puntos de control claros"
          : "Break tasks into smaller, manageable chunks with clear checkpoints"
      );
      classroomStrategies.push(
        language === "es"
          ? "Proporcionar descansos frecuentes y oportunidades de movimiento"
          : "Provide frequent breaks and movement opportunities"
      );
    }

    if (data.neurodivergence.anxiety) {
      classroomStrategies.push(
        language === "es"
          ? "Crear un rincon tranquilo o espacio seguro para la autorregulacion"
          : "Create a calm corner or safe space for self-regulation"
      );
      classroomStrategies.push(
        language === "es"
          ? "Dar aviso previo de transiciones y cambios en la rutina"
          : "Provide advance notice of transitions and changes to routine"
      );
    }

    if (data.neurodivergence.sensoryOverload) {
      classroomStrategies.push(
        language === "es"
          ? "Ofrecer audifonos con cancelacion de ruido o herramientas fidget"
          : "Offer noise-canceling headphones or fidget tools"
      );
    }

    if (classroomStrategies.length === 0) {
      classroomStrategies.push(
        useKaq
          ? "Tijonik pa tinamit richin junamaj."
          : language === "es"
          ? "Continuar con practicas estandar de instruccion diferenciada"
          : "Continue with standard differentiated instruction practices"
      );
    }

    const titleClassroom = useKaq ? "Tz'ukul pa tinamit" : language === "es" ? "Estrategia de Aula" : "Classroom Strategy";
    sections.push({
      id: "classroom",
      title: titleClassroom,
      icon: School,
      content: classroomStrategies,
      priority: classroomStrategies.length > 3 ? "high" : "medium",
    });

    const homeStrategies: string[] = [];

    if (data.neurodivergence.attention) {
      homeStrategies.push(
        language === "es"
          ? "Crear un espacio dedicado libre de distracciones para tareas"
          : "Create a dedicated, distraction-free homework space"
      );
      homeStrategies.push(
        language === "es"
          ? "Usar listas visuales de verificacion para rutinas y tareas diarias"
          : "Use visual checklists for daily routines and tasks"
      );
    }

    if (data.neurodivergence.anxiety) {
      homeStrategies.push(
        language === "es"
          ? "Practicar tecnicas de calma como respiracion profunda juntos"
          : "Practice calming techniques like deep breathing together"
      );
    }

    if (data.neurodivergence.socialInteraction) {
      homeStrategies.push(
        language === "es"
          ? "Practicar escenarios sociales a traves de juegos de roles en casa"
          : "Practice social scenarios through role-play at home"
      );
    }

    if (homeStrategies.length === 0) {
      homeStrategies.push(
        language === "es"
          ? "Apoyar el aprendizaje con refuerzo positivo y aliento"
          : "Support learning through positive reinforcement and encouragement"
      );
    }

    const titleHome = useKaq ? "Tz'ukul pa jay" : language === "es" ? "Plan para el Hogar" : "Home Plan";
    sections.push({
      id: "home",
      title: titleHome,
      icon: Home,
      content: homeStrategies,
      priority: homeStrategies.length > 3 ? "high" : "medium",
    });

    const referrals: string[] = [];

    if (data.neurodivergence.attention || data.neurodivergence.hyperactivity) {
      referrals.push(
        language === "es"
          ? "Considerar evaluacion por pediatra del desarrollo o psiquiatra para evaluacion de TDAH"
          : "Consider evaluation by a developmental pediatrician or psychiatrist for ADHD assessment"
      );
    }

    if (data.neurodivergence.socialInteraction) {
      referrals.push(
        language === "es"
          ? "Recomendar evaluacion por psicologo especializado en trastornos del espectro autista"
          : "Recommend assessment by a psychologist specializing in autism spectrum disorders"
      );
    }

    if (data.neurodivergence.anxiety) {
      referrals.push(
        language === "es"
          ? "Considerar referencia a psicologo infantil o consejero para manejo de ansiedad"
          : "Consider referral to a child psychologist or counselor for anxiety management"
      );
    }

    if (referrals.length === 0) {
      referrals.push(
        language === "es"
          ? "No se recomiendan derivaciones inmediatas a especialistas segun la evaluacion actual"
          : "No immediate specialist referrals recommended based on current assessment"
      );
    }

    const titleReferrals = useKaq ? "K'utunikil k'wajinel" : language === "es" ? "Referencias Profesionales" : "Professional Referrals";
    sections.push({
      id: "referrals",
      title: titleReferrals,
      icon: Stethoscope,
      content: referrals,
      priority: referrals.length > 2 ? "high" : "low",
    });

    return sections;
  };

  interface AIResultsResponse {
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

  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>("es");
  const [report, setReport] = useState<ReportSection[]>(() => generateReport("es"));
  const [familySummaryKaqchikel, setFamilySummaryKaqchikel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildSubjectStrategiesFallback = (): SubjectStrategies => {
    const base: SubjectStrategies = {
      numeracy: [],
      language: [],
      foreignLanguage: [],
      arts: [],
      ict: [],
      other: [],
    };

    const push = (key: keyof SubjectStrategies, es: string, en: string) => {
      base[key].push(language === "es" ? es : en);
    };

    // Estrategias numéricas / matemáticas
    push(
      "numeracy",
      "Usar apoyos visuales y manipulativos (regletas, bloques, gráficos) para representar problemas numéricos.",
      "Use visual supports and manipulatives (blocks, charts) to represent numerical problems."
    );
    push(
      "numeracy",
      "Dividir los ejercicios en pocos ítems por página y aumentar progresivamente la dificultad.",
      "Break worksheets into few items per page and increase difficulty gradually."
    );

    // Lenguaje
    push(
      "language",
      "Ofrecer organizadores gráficos (mapas de ideas, secuencias) antes de pedir redacciones o resúmenes.",
      "Provide graphic organizers (mind maps, sequences) before asking for writing or summaries."
    );
    push(
      "language",
      "Permitir respuestas orales o apoyadas en imágenes cuando la escritura sea una barrera.",
      "Allow oral responses or picture-supported answers when writing is a barrier."
    );

    // Nuevo idioma
    push(
      "foreignLanguage",
      "Priorizar vocabulario funcional y actividades orales apoyadas con gestos, imágenes y repetición multisensorial.",
      "Prioritize functional vocabulary and oral activities supported by gestures, images, and multisensory repetition."
    );

    // Artísticas
    push(
      "arts",
      "Usar actividades artísticas como vía para expresar emociones e ideas cuando el lenguaje verbal resulte difícil.",
      "Use arts activities as a way to express emotions and ideas when verbal language is difficult."
    );

    // TIC
    push(
      "ict",
      "Introducir herramientas digitales accesibles (lectores de pantalla, correctores, dictado por voz) según las necesidades del alumno.",
      "Introduce accessible digital tools (screen readers, spell checkers, speech-to-text) according to student needs."
    );

    // Algo nuevo / otros
    push(
      "other",
      "Co-diseñar con el alumno una meta personal de aprendizaje trimestral y revisar su avance con lenguaje sencillo.",
      "Co-design a personal learning goal with the student for the term and review progress using simple language."
    );

    return base;
  };

  const [subjectStrategies, setSubjectStrategies] = useState<SubjectStrategies>(
    () => buildSubjectStrategiesFallback()
  );

  const buildResultsPrompt = (): string => {
    const name = data.studentName || (language === "es" ? "el estudiante" : "the student");
    const age = data.studentAge || (language === "es" ? "no especificada" : "not specified");

    const sensorialSummary = `
Visual: ${data.sensorial.visualImpairment}
Hearing: ${data.sensorial.hearingImpairment}
Motor skills: ${data.sensorial.motorSkills}
Assistive tech: ${data.sensorial.assistiveTech.join(", ") || "none reported"}
`.trim();

    const neuroSummary = `
Attention indicators: ${data.neurodivergence.attention}
Hyperactivity/impulsivity indicators: ${data.neurodivergence.hyperactivity}
Social interaction indicators: ${data.neurodivergence.socialInteraction}
Anxiety/emotional regulation indicators: ${data.neurodivergence.anxiety}
Sensory overload indicators: ${data.neurodivergence.sensoryOverload}
Additional notes: ${data.neurodivergence.additionalNotes || "none"}
`.trim();

    const conversationSummary =
      data.aiResponses.length === 0
        ? language === "es"
          ? "No se registraron respuestas en la evaluación adaptativa con IA."
          : "No responses were recorded in the AI adaptive assessment."
        : data.aiResponses
            .map(
              (item, index) =>
                `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`
            )
            .join("\n\n");

    const reportLangInstruction =
      reportLanguage === "kaqchikel"
        ? "Escribe TODOS los textos del informe (classroom_strategy, home_plan, professional_referrals, subject_strategies) EN KAQCHIKEL (idioma maya de Guatemala). Usa vocabulario claro y comprensible para familias."
        : reportLanguage === "en"
        ? "Write ALL report texts (classroom_strategy, home_plan, professional_referrals, subject_strategies) IN ENGLISH, clear and accessible for families and teachers."
        : "Escribe TODOS los textos del informe (classroom_strategy, home_plan, professional_referrals, subject_strategies) EN ESPAÑOL claro y comprensible para familias y docentes.";

    return `
Datos de la evaluación del alumno:
- Nombre: ${name}
- Edad: ${age}

Resumen sensorial y físico:
${sensorialSummary}

Resumen de indicadores de neurodivergencia y conducta:
${neuroSummary}

Resumen de la conversación con IA (preguntas y respuestas clave):
${conversationSummary}

Como experto en psicopedagogía inclusiva, usando DSM-5 y enfoque DUA, genera un INFORME ESTRUCTURADO con:
1) Estrategias y adaptaciones para el AULA que apoyen la inclusión y el acceso al aprendizaje.
2) Un plan de apoyo para el HOGAR con acciones concretas para los cuidadores.
3) Recomendaciones sobre posibles DERIVACIONES PROFESIONALES (si corresponde), sin dar diagnósticos.
4) Un bloque de recomendaciones breves por ÁREA/MATERIA para: habilidades numéricas/matemáticas, lenguaje y lectura-escritura, aprendizaje de un nuevo idioma, áreas artísticas, TIC y \"algo nuevo\" o complementario.
5) Resumen para la familia en Kaqchikel: exactamente 3 consejos clave en idioma KAQCHIKEL (maya de Guatemala) para que padres que prefieren su lengua materna comprendan el apoyo que necesita el niño. Inclúyelos en el campo family_summary_kaqchikel.

NO hagas diagnósticos. Solo orienta y explica apoyos posibles.
${reportLangInstruction}

Devuelve ÚNICAMENTE un objeto JSON válido (sin comentarios, sin texto fuera del JSON, sin markdown) con esta estructura exacta:
{
  "classroom_strategy": ["texto 1", "texto 2", "..."],
  "home_plan": ["texto 1", "texto 2", "..."],
  "professional_referrals": ["texto 1", "texto 2", "..."],
  "subject_strategies": {
    "numeracy": ["texto 1", "texto 2", "..."],
    "language": ["texto 1", "texto 2", "..."],
    "foreign_language": ["texto 1", "texto 2", "..."],
    "arts": ["texto 1", "texto 2", "..."],
    "ict": ["texto 1", "texto 2", "..."],
    "other": ["texto 1", "texto 2", "..."]
  },
  "family_summary_kaqchikel": ["consejo 1 en Kaqchikel", "consejo 2 en Kaqchikel", "consejo 3 en Kaqchikel"]
}
    `.trim();
  };

  const getSectionTitles = (lang: ReportLanguage) => {
    const titles = {
      classroom: { es: "Estrategia de Aula", en: "Classroom Strategy", kaqchikel: "Tz'ukul pa tinamit" },
      home: { es: "Plan para el Hogar", en: "Home Plan", kaqchikel: "Tz'ukul pa jay" },
      referrals: { es: "Referencias Profesionales", en: "Professional Referrals", kaqchikel: "K'utunikil k'wajinel" },
    };
    return titles;
  };

  const buildSectionsFromAI = (ai: AIResultsResponse): { sections: ReportSection[]; subjects: SubjectStrategies; kaqchikel: string[] } => {
    const sections: ReportSection[] = [];
    const subjects: SubjectStrategies = {
      numeracy: [],
      language: [],
      foreignLanguage: [],
      arts: [],
      ict: [],
      other: [],
    };
    const titles = getSectionTitles(reportLanguage);

    const classroom = ai.classroom_strategy && ai.classroom_strategy.length > 0
      ? ai.classroom_strategy
      : [
          reportLanguage === "es"
            ? "Aplicar estrategias generales de diferenciación e inclusión en el aula."
            : reportLanguage === "kaqchikel"
            ? "Tijonïk pa tinamit richin junamaj."
            : "Apply general differentiation and inclusion strategies in the classroom.",
        ];

    const home = ai.home_plan && ai.home_plan.length > 0
      ? ai.home_plan
      : [
          reportLanguage === "es"
            ? "Brindar apoyo emocional y refuerzo positivo en casa."
            : reportLanguage === "kaqchikel"
            ? "K'ak'a' to'ob'äl pa jay."
            : "Provide emotional support and positive reinforcement at home.",
        ];

    const referrals = ai.professional_referrals && ai.professional_referrals.length > 0
      ? ai.professional_referrals
      : [
          reportLanguage === "es"
            ? "Por ahora no se sugieren derivaciones específicas; continuar observando y documentando."
            : reportLanguage === "kaqchikel"
            ? "K'a k'atzinel nitz'ukuj; titz'et kaj titz'ib'aj."
            : "No specific referrals suggested at this time; continue observing and documenting.",
        ];

    const kaqchikelTips =
      ai.family_summary_kaqchikel && ai.family_summary_kaqchikel.length >= 3
        ? ai.family_summary_kaqchikel.slice(0, 3)
        : [
            "Tz'etel ala' pa ruq'a' ruk'u'x, xa jun chi q'ij.",
            "Taqa' to'ob'äl pa jay ruma ri ala'.",
            "Titzijonïk pa tinamit chuqa' pa jay richin ri ala' nuk'äm.",
          ];

    sections.push({
      id: "classroom",
      title: titles.classroom[reportLanguage],
      icon: School,
      content: classroom,
      priority: classroom.length > 3 ? "high" : "medium",
    });

    sections.push({
      id: "home",
      title: titles.home[reportLanguage],
      icon: Home,
      content: home,
      priority: home.length > 3 ? "high" : "medium",
    });

    sections.push({
      id: "referrals",
      title: titles.referrals[reportLanguage],
      icon: Stethoscope,
      content: referrals,
      priority: referrals.length > 2 ? "high" : "low",
    });

    const subj = ai.subject_strategies ?? {};

    const mapOrFallback = (
      key: keyof SubjectStrategies,
      source?: string[],
      esLabel?: string,
      enLabel?: string
    ) => {
      if (source && source.length > 0) {
        subjects[key] = source;
      } else if (esLabel && enLabel) {
        subjects[key] = [
          language === "es"
            ? esLabel
            : enLabel,
        ];
      }
    };

    mapOrFallback(
      "numeracy",
      subj.numeracy,
      "Ofrecer andamiajes visuales y ejemplos paso a paso en contenidos numéricos.",
      "Provide visual scaffolds and step-by-step examples for numeracy content."
    );
    mapOrFallback(
      "language",
      subj.language,
      "Asegurar múltiples oportunidades de lectura compartida y escritura guiada.",
      "Ensure multiple opportunities for shared reading and guided writing."
    );
    mapOrFallback(
      "foreignLanguage",
      subj.foreign_language,
      "Usar apoyos visuales y gestuales al introducir vocabulario en un nuevo idioma.",
      "Use visual and gestural supports when introducing vocabulary in a new language."
    );
    mapOrFallback(
      "arts",
      subj.arts,
      "Permitir explorar diferentes lenguajes artísticos para expresar ideas (dibujo, música, movimiento).",
      "Allow exploration of different art forms (drawing, music, movement) to express ideas."
    );
    mapOrFallback(
      "ict",
      subj.ict,
      "Seleccionar aplicaciones y plataformas accesibles que faciliten la organización y el estudio.",
      "Select accessible apps and platforms that support organization and study."
    );
    mapOrFallback(
      "other",
      subj.other,
      "Revisar periódicamente con el alumno qué apoyos siente más útiles y ajustar el plan.",
      "Review regularly with the student which supports feel most useful and adjust the plan."
    );

    return { sections, subjects, kaqchikel: kaqchikelTips };
  };

  useEffect(() => {
    let cancelled = false;

    const generateAIReport = async () => {
      setLoading(true);
      setError(null);

      const fallbackSections = generateReport(reportLanguage);
      const fallbackSubjects = buildSubjectStrategiesFallback();

      const applyFallback = (message: string) => {
        setReport(fallbackSections);
        setSubjectStrategies(fallbackSubjects);
        setFamilySummaryKaqchikel([
          "Tz'etel ala' pa ruq'a' ruk'u'x, xa jun chi q'ij.",
          "Taqa' to'ob'äl pa jay ruma ri ala'.",
          "Titzijonïk pa tinamit chuqa' pa jay richin ri ala' nuk'äm.",
        ]);
        setError(message);
      };

      const iconsBySection: Record<string, React.ElementType> = {
        classroom: School,
        home: Home,
        referrals: Stethoscope,
      };

      try {
        const response = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentData: data,
            reportLanguage,
            language: language === "es" ? "es" : "en",
          }),
        });

        const dataResp = (await response.json()) as { snapshot?: ReportSnapshot; error?: string };

        if (!response.ok || !dataResp.snapshot) {
          const friendly =
            typeof dataResp.error === "string" && dataResp.error.length > 0
              ? dataResp.error
              : language === "es"
                ? "No se pudo generar el informe automático con IA en este momento. Se muestra una versión estándar basada en las respuestas."
                : "Could not generate the automatic AI report right now. Showing a standard version based on the responses.";
          if (!cancelled) applyFallback(friendly);
          return;
        }

        const snapshot = dataResp.snapshot;
        if (!cancelled) {
          setReport(
            snapshot.report.map((section) => ({
              id: section.id,
              title: section.title,
              content: section.content,
              priority: section.priority,
              icon: iconsBySection[section.id] ?? School,
            }))
          );
          setSubjectStrategies({
            numeracy: snapshot.subjectStrategies.numeracy ?? [],
            language: snapshot.subjectStrategies.language ?? [],
            foreignLanguage: snapshot.subjectStrategies.foreignLanguage ?? [],
            arts: snapshot.subjectStrategies.arts ?? [],
            ict: snapshot.subjectStrategies.ict ?? [],
            other: snapshot.subjectStrategies.other ?? [],
          });
          setFamilySummaryKaqchikel(snapshot.familySummaryKaqchikel ?? []);
          setError(null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          applyFallback(
            language === "es"
              ? "No se pudo generar el informe automático con IA. Se muestra una versión estándar basada en las respuestas."
              : "Could not generate the automatic AI report. Showing a standard version based on the responses."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void generateAIReport();

    return () => {
      cancelled = true;
    };
  }, [data, language, reportLanguage]);

  useEffect(() => {
    if (!onReportSnapshotChange) return;
    const snapshot: ReportSnapshot = {
      report: report.map(({ id, title, content, priority }) => ({ id, title, content, priority })),
      subjectStrategies: { ...subjectStrategies },
      familySummaryKaqchikel: [...familySummaryKaqchikel],
      reportLanguage,
    };
    onReportSnapshotChange(snapshot);
  }, [report, subjectStrategies, familySummaryKaqchikel, reportLanguage, onReportSnapshotChange]);

  const handleExportPDF = async () => {
    try {
      let logoBase64: string | null = null;
      try {
        const res = await fetch("/logo.jpeg");
        const blob = await res.blob();
        logoBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      } catch {
        // Sin logo si falla la carga
      }

      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
      });

      const pageHeight = 297;
      const marginTop = 22;
      const marginLeft = 20;
      const marginRight = 20;
      const maxWidth = 210 - marginLeft - marginRight; // 170mm
      const lineHeight = 5.5;
      const lineHeightTitle = 7;
      const bottomMargin = 25;
      const maxY = pageHeight - bottomMargin;

      let cursorY = marginTop;

      if (logoBase64) {
        const logoW = 45;
        const logoH = 18;
        doc.addImage(logoBase64, "JPEG", marginLeft, 8, logoW, logoH);
        cursorY = 8 + logoH + 4;
      }

      const maybeNewPage = (needed: number) => {
        if (cursorY + needed > maxY) {
          doc.addPage();
          cursorY = marginTop;
        }
      };

      const drawLines = (lines: string[], indent = 0) => {
        const x = marginLeft + indent;
        for (let i = 0; i < lines.length; i++) {
          maybeNewPage(lineHeight);
          doc.text(lines[i], x, cursorY);
          cursorY += lineHeight;
        }
      };

      const addTitle = (text: string) => {
        maybeNewPage(lineHeightTitle * 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        const lines = doc.splitTextToSize(String(text), maxWidth);
        drawLines(lines);
        cursorY += 3;
      };

      const addSubtitle = (text: string) => {
        maybeNewPage(lineHeightTitle);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(String(text), maxWidth);
        drawLines(lines);
        cursorY += 4;
      };

      const addSectionTitle = (text: string) => {
        maybeNewPage(lineHeightTitle + 2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(String(text), maxWidth);
        drawLines(lines);
        cursorY += 2;
      };

      const addBulletList = (items: string[]) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const bullet = "  \u2022 ";
        items.forEach((item) => {
          const safe = String(item ?? "").trim();
          if (!safe) return;
          const wrapped = doc.splitTextToSize(safe, maxWidth - 8);
          wrapped.forEach((line, i) => {
            maybeNewPage(lineHeight);
            doc.text(i === 0 ? bullet + line : "      " + line, marginLeft, cursorY);
            cursorY += lineHeight;
          });
        });
        cursorY += 2;
      };

      const addSpacer = (mm: number = 4) => {
        cursorY += mm;
        if (cursorY > maxY - 10) {
          doc.addPage();
          cursorY = marginTop;
        }
      };

      const studentName = (data.studentName || (language === "es" ? "Estudiante sin nombre" : "Unnamed student")).trim() || "Alumno";

      const pdfTitleByLang =
        reportLanguage === "kaqchikel"
          ? "Rutz'ib'axik richin junamaj (Kaqchikel)"
          : reportLanguage === "en"
          ? "Inclusive Psychoeducational Report (English)"
          : "Informe Psicopedagogico de Inclusion (Espanol)";

      // --- Encabezado (título del reporte) ---
      addTitle(pdfTitleByLang);

      const labels = PDF_LABELS[reportLanguage];
      addSubtitle(`${labels.student}: ${studentName}`);
      for (const line of getTeacherPdfLines(teacherPdf, language === "es")) {
        addSubtitle(line);
      }

      addSpacer(2);

      // --- Perfil general ---
      addSectionTitle(labels.profile);

      const overviewLines: string[] = [];
      overviewLines.push(
        `${labels.age}: ${data.studentAge || labels.ageNotSpec}`
      );
      overviewLines.push(
        `${labels.sensorial}: vista=${data.sensorial.visualImpairment}, audicion=${data.sensorial.hearingImpairment}, motricidad=${data.sensorial.motorSkills}`
      );
      const yesNo = reportLanguage === "en" ? ["yes", "no"] : reportLanguage === "kaqchikel" ? ["ja", "mani"] : ["sí", "no"];
      overviewLines.push(
        `${labels.neuro}: atencion=${data.neurodivergence.attention ? yesNo[0] : yesNo[1]}, hiperactividad=${data.neurodivergence.hyperactivity ? yesNo[0] : yesNo[1]}, social=${data.neurodivergence.socialInteraction ? yesNo[0] : yesNo[1]}, ansiedad=${data.neurodivergence.anxiety ? yesNo[0] : yesNo[1]}, sensorial=${data.neurodivergence.sensoryOverload ? yesNo[0] : yesNo[1]}`
      );
      if (data.neurodivergence.additionalNotes) {
        overviewLines.push(
          labels.notes + " " + String(data.neurodivergence.additionalNotes).slice(0, 200)
        );
      }
      addBulletList(overviewLines);

      // --- Resumen conversacion IA ---
      if (data.aiResponses.length > 0) {
        addSectionTitle(labels.convSummary);
        const lastResponses = data.aiResponses.slice(-3);
        const aiSummary = lastResponses.map((entry, index) => {
          const q = String(entry.question ?? "").slice(0, 120);
          const a = String(entry.answer ?? "").slice(0, 120);
          return language === "es"
            ? `P${index + 1}: ${q} | R${index + 1}: ${a}`
            : `Q${index + 1}: ${q} | A${index + 1}: ${a}`;
        });
        addBulletList(aiSummary);
      }

      addSpacer(4);

      // --- Secciones del reporte ---
      report.forEach((section) => {
        addSectionTitle(section.title);
        addBulletList(section.content);
        addSpacer(2);
      });

      // --- Estrategias por materia ---
      const subjectSectionTitle =
        reportLanguage === "kaqchikel"
          ? "Tz'ukul pa k'ojlib'al"
          : reportLanguage === "en"
          ? "Subject-specific strategies"
          : "Estrategias por materia";
      addSectionTitle(subjectSectionTitle);

      const subjectLabels: { key: keyof SubjectStrategies; es: string; en: string; kaqchikel: string }[] = [
        { key: "numeracy", es: "Area numerica / Matematicas", en: "Numeracy / Mathematics", kaqchikel: "Ajilab'al" },
        { key: "language", es: "Lenguaje y lectoescritura", en: "Language and literacy", kaqchikel: "Tz'ib'axik" },
        { key: "foreignLanguage", es: "Aprendizaje de nuevo idioma", en: "New language learning", kaqchikel: "Ch'ab'al k'ak'a'" },
        { key: "arts", es: "Areas artisticas", en: "Arts", kaqchikel: "B'itz'ib'" },
        { key: "ict", es: "TIC", en: "ICT", kaqchikel: "TIC" },
        { key: "other", es: "Otros apoyos recomendados", en: "Other recommended supports", kaqchikel: "Juley chik" },
      ];

      subjectLabels.forEach(({ key, es, en, kaqchikel }) => {
        const items = subjectStrategies[key];
        if (!items || items.length === 0) return;
        addSpacer(2);
        const label = reportLanguage === "kaqchikel" ? kaqchikel : reportLanguage === "en" ? en : es;
        addSectionTitle(label);
        addBulletList(items);
      });

      // --- Resumen para la familia en Kaqchikel ---
      addSpacer(4);
      addSectionTitle(labels.familyKaqchikel);
      const kaqchikelForPdf =
        familySummaryKaqchikel.length >= 3
          ? familySummaryKaqchikel
          : [
              "Tz'etel ala' pa ruq'a' ruk'u'x, xa jun chi q'ij.",
              "Taqa' to'ob'al pa jay ruma ri ala'.",
              "Titzijonik pa tinamit chuqa' pa jay richin ri ala' nuk'am.",
            ];
      addBulletList(kaqchikelForPdf);

      // --- Pie ---
      addSpacer(6);
      maybeNewPage(15);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const footerText = labels.footer;
      const footerLines = doc.splitTextToSize(footerText, maxWidth);
      drawLines(footerLines);

      const fileName =
        (language === "es" ? "Informe_" : "Report_") +
        (studentName.replace(/\s+/g, "_") || "alumno") +
        ".pdf";

      doc.save(fileName);
      const snapshot: ReportSnapshot = {
        report: report.map(({ id, title, content, priority }) => ({ id, title, content, priority })),
        subjectStrategies: { ...subjectStrategies },
        familySummaryKaqchikel: [...familySummaryKaqchikel],
        reportLanguage,
      };
      onPdfExported?.(snapshot);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert(
        language === "es"
          ? "No se pudo generar el PDF. Revisa la consola para más detalles."
          : "Could not generate the PDF. Check the console for details."
      );
    }
  };

  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning-foreground border-warning/20",
    low: "bg-success/10 text-success border-success/20",
  };

  const priorityLabels = {
    high: t("results.high"),
    medium: t("results.medium"),
    low: t("results.low"),
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5 print:border print:bg-white">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{t("results.title")}</CardTitle>
              <CardDescription className="mt-2">
                {t("results.subtitle")} {data.studentName}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                {language === "es" ? "Idioma del reporte:" : "Report language:"}
              </label>
              <select
                value={reportLanguage}
                onChange={(e) => setReportLanguage(e.target.value as ReportLanguage)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                aria-label={language === "es" ? "Idioma del reporte" : "Report language"}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="kaqchikel">Kaqchikel</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
                {t("results.exportPdf")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.sensorial.visualImpairment !== "none" && (
              <Badge variant="outline">{t("sensorial.visualAcuity")}</Badge>
            )}
            {data.sensorial.hearingImpairment !== "none" && (
              <Badge variant="outline">{t("sensorial.hearingLevel")}</Badge>
            )}
            {data.neurodivergence.attention && <Badge variant="outline">{t("neuro.attention")}</Badge>}
            {data.neurodivergence.hyperactivity && <Badge variant="outline">{t("neuro.hyperactivity")}</Badge>}
            {data.neurodivergence.anxiety && <Badge variant="outline">{t("neuro.anxiety")}</Badge>}
            {data.neurodivergence.socialInteraction && <Badge variant="outline">{t("neuro.social")}</Badge>}
            {data.neurodivergence.sensoryOverload && <Badge variant="outline">{t("neuro.sensory")}</Badge>}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <p className="text-sm text-muted-foreground">
          {language === "es"
            ? "Generando informe personalizado con IA..."
            : "Generating personalized AI report..."}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Accordion type="single" collapsible defaultValue="classroom" className="space-y-4">
        {report.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="rounded-lg border bg-card px-6"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {section.content.length} {language === "es" ? "recomendaciones" : "recommendations"}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`ml-auto ${priorityColors[section.priority]}`}
                >
                  {priorityLabels[section.priority]}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <Separator className="mb-4" />
              <div className="mb-4 flex justify-end print:hidden">
                <ReadAloudButton
                  text={section.content.join(". ")}
                  sectionTitle={section.title}
                />
              </div>
              <ul className="space-y-3" role="list">
                {section.content.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card>
        <CardHeader>
          <CardTitle>
            {reportLanguage === "kaqchikel"
              ? "Tz'ukul pa k'ojlib'al"
              : reportLanguage === "en"
              ? "Subject-specific strategies"
              : "Estrategias por materia"}
          </CardTitle>
          <CardDescription>
            {language === "es"
              ? "Recomendaciones concretas de apoyo por área curricular, basadas en el perfil del alumno."
              : "Concrete support recommendations per subject area, based on the student's profile."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              { key: "numeracy", es: "Área numérica / Matemáticas", en: "Numeracy / Mathematics", kaqchikel: "Ajilab'al" },
              { key: "language", es: "Lenguaje y lectoescritura", en: "Language and literacy", kaqchikel: "Tz'ib'axik" },
              { key: "foreignLanguage", es: "Aprendizaje de nuevo idioma", en: "New language learning", kaqchikel: "Ch'ab'al k'ak'a'" },
              { key: "arts", es: "Áreas artísticas", en: "Arts", kaqchikel: "B'itz'ib'" },
              { key: "ict", es: "TIC", en: "ICT", kaqchikel: "TIC" },
              { key: "other", es: "Otros apoyos recomendados", en: "Other recommended supports", kaqchikel: "Juley chik" },
            ] as const
          ).map(({ key, es, en, kaqchikel }) => {
            const items = subjectStrategies[key as keyof SubjectStrategies];
            if (!items || items.length === 0) return null;
            const label = reportLanguage === "kaqchikel" ? kaqchikel : reportLanguage === "en" ? en : es;

            return (
              <div key={key} className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {label}
                </h3>
                <ul className="space-y-1 text-sm" role="list">
                  {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Resumen para la familia en Kaqchikel
          </CardTitle>
          <CardDescription>
            {language === "es"
              ? "Tres consejos clave en idioma maya Kaqchikel (Guatemala) para que las familias comprendan el apoyo que necesita el niño."
              : "Three key tips in Kaqchikel Mayan language (Guatemala) so families understand the support the child needs."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3" role="list">
            {(familySummaryKaqchikel.length >= 3 ? familySummaryKaqchikel : [
              "Tz'etel ala' pa ruq'a' ruk'u'x, xa jun chi q'ij.",
              "Taqa' to'ob'äl pa jay ruma ri ala'.",
              "Titzijonïk pa tinamit chuqa' pa jay richin ri ala' nuk'äm.",
            ]).map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
