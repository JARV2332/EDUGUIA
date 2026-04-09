/**
 * Persistencia de estudiantes y sus evaluaciones en localStorage.
 * Tipos compartidos para evitar dependencias circulares.
 */

export interface AssessmentData {
  studentName: string;
  studentAge: string;
  sensorial: {
    visualImpairment: string;
    hearingImpairment: string;
    motorSkills: string;
    assistiveTech: string[];
  };
  neurodivergence: {
    attention: boolean;
    hyperactivity: boolean;
    socialInteraction: boolean;
    anxiety: boolean;
    sensoryOverload: boolean;
    additionalNotes: string;
  };
  aiResponses: Array<{ question: string; answer: string }>;
}

export interface TimelineEntry {
  id: number;
  date: string;
  type: "assessment" | "observation" | "milestone" | "intervention";
  title: string;
  description: string;
  author: string;
}

/** Sección del informe para persistir (sin ícono React). */
export interface ReportSectionStored {
  id: string;
  title: string;
  content: string[];
  priority: "high" | "medium" | "low";
}

/** Estrategias por materia para persistir. */
export interface SubjectStrategiesStored {
  numeracy: string[];
  language: string[];
  foreignLanguage: string[];
  arts: string[];
  ict: string[];
  other: string[];
}

export type ReportLanguageStored = "es" | "en" | "kaqchikel";

/** Snapshot del informe generado por la IA para guardar y descargar desde Progreso. */
export interface ReportSnapshot {
  report: ReportSectionStored[];
  subjectStrategies: SubjectStrategiesStored;
  familySummaryKaqchikel: string[];
  reportLanguage: ReportLanguageStored;
}

export interface SavedStudent {
  id: string;
  name: string;
  age: string;
  assessmentData: AssessmentData;
  completedAt: string;
  timeline: TimelineEntry[];
  /** Informe generado por la IA (secciones, estrategias, resumen Kaqchikel). */
  reportSnapshot?: ReportSnapshot;
}

const STORAGE_KEY = "inclusion-app-students";

function loadFromStorage(): SavedStudent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedStudent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(students: SavedStudent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error("Error saving students:", e);
  }
}

export function getSavedStudents(): SavedStudent[] {
  return loadFromStorage();
}

/** Reemplaza la lista completa en localStorage (p. ej. tras fusionar con Supabase). */
export function setSavedStudents(students: SavedStudent[]): void {
  saveToStorage(students);
}

export function addSavedStudent(
  assessmentData: AssessmentData,
  reportSnapshot?: ReportSnapshot,
  /** Si se proporciona (p. ej. id de Supabase), se usa en lugar de generar uno nuevo */
  idOverride?: string
): SavedStudent {
  const students = loadFromStorage();
  const id = idOverride ?? crypto.randomUUID?.() ?? `s-${Date.now()}`;
  const name = assessmentData.studentName.trim() || "Sin nombre";
  const age = assessmentData.studentAge.trim() || "";
  const completedAt = new Date().toISOString().split("T")[0];

  const entry: SavedStudent = {
    id,
    name,
    age,
    assessmentData: { ...assessmentData },
    completedAt,
    timeline: [
      {
        id: 1,
        date: completedAt,
        type: "assessment",
        title: "Evaluación inicial completada",
        description: "Perfil de inclusión y recomendaciones generados.",
        author: "EDUGUIA",
      },
    ],
    ...(reportSnapshot && { reportSnapshot }),
  };

  students.unshift(entry);
  saveToStorage(students);
  return entry;
}

export function updateStudentTimeline(studentId: string, timeline: TimelineEntry[]) {
  const students = loadFromStorage();
  const index = students.findIndex((s) => s.id === studentId);
  if (index === -1) return;
  students[index] = { ...students[index], timeline: [...timeline] };
  saveToStorage(students);
}

export function getSavedStudent(id: string): SavedStudent | undefined {
  return loadFromStorage().find((s) => s.id === id);
}

export function deleteSavedStudent(id: string): void {
  const students = loadFromStorage().filter((s) => s.id !== id);
  saveToStorage(students);
}
