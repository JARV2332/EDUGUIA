"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getSavedStudents,
  addSavedStudent,
  updateStudentTimeline,
  setSavedStudents,
  type SavedStudent,
  type AssessmentData,
  type TimelineEntry,
  type ReportSnapshot,
} from "@/lib/student-store";
import { createClient } from "@/lib/supabase/client";

interface StudentsContextType {
  students: SavedStudent[];
  /** Añade estudiante. Si existingEstudianteId está definido, no inserta en Supabase (usa ese id en localStorage). */
  addStudent: (data: AssessmentData, reportSnapshot?: ReportSnapshot, existingEstudianteId?: string) => Promise<SavedStudent>;
  /** Crea un estudiante "borrador" en Supabase y devuelve su id (para chat/informe antes de guardar). */
  createDraftStudent: (data: AssessmentData) => Promise<string | null>;
  updateTimeline: (studentId: string, timeline: TimelineEntry[]) => void;
  refresh: () => void;
  refreshFromSupabase: () => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<SavedStudent[]>([]);

  const refresh = useCallback(() => {
    setStudents(getSavedStudents());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createDraftStudent = useCallback(async (data: AssessmentData): Promise<string | null> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: docente } = await supabase
      .from("docentes")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!docente?.id) return null;
    const completedAt = new Date().toISOString().split("T")[0];
    const { data: inserted, error } = await supabase
      .from("estudiantes")
      .insert({
        docente_id: docente.id,
        nombre: (data.studentName || "Sin nombre").trim(),
        edad: data.studentAge?.trim() || null,
        assessment_data: data as unknown as Record<string, unknown>,
        completed_at: completedAt,
      })
      .select("id")
      .single();
    return error ? null : inserted?.id ?? null;
  }, []);

  const addStudent = useCallback(async (
    data: AssessmentData,
    reportSnapshot?: ReportSnapshot,
    existingEstudianteId?: string
  ): Promise<SavedStudent> => {
    if (existingEstudianteId) {
      const saved = addSavedStudent(data, reportSnapshot, existingEstudianteId);
      setStudents((prev) => [saved, ...prev]);
      return saved;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: docente } = await supabase
        .from("docentes")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (docente?.id) {
        const completedAt = new Date().toISOString().split("T")[0];
        const { data: inserted, error } = await supabase
          .from("estudiantes")
          .insert({
            docente_id: docente.id,
            nombre: (data.studentName || "Sin nombre").trim(),
            edad: data.studentAge?.trim() || null,
            assessment_data: data as unknown as Record<string, unknown>,
            completed_at: completedAt,
          })
          .select("id")
          .single();
        if (!error && inserted?.id) {
          const saved = addSavedStudent(data, reportSnapshot, inserted.id);
          setStudents((prev) => [saved, ...prev]);
          return saved;
        }
      }
    }
    const saved = addSavedStudent(data, reportSnapshot);
    setStudents((prev) => [saved, ...prev]);
    return saved;
  }, []);

  const refreshFromSupabase = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const local = getSavedStudents();
    if (!user) {
      setStudents(local);
      return;
    }
    const { data: docente } = await supabase
      .from("docentes")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!docente?.id) {
      setStudents(local);
      return;
    }
    const { data: rows } = await supabase
      .from("estudiantes")
      .select("id, nombre, edad, assessment_data, completed_at")
      .eq("docente_id", docente.id)
      .order("completed_at", { ascending: false });
    const defaultTimeline: TimelineEntry[] = [
      { id: 1, date: new Date().toISOString().split("T")[0], type: "assessment", title: "Evaluación inicial completada", description: "Perfil de inclusión y recomendaciones generados.", author: "EDUGUIA" },
    ];
    const fromSupabase: SavedStudent[] = (rows ?? []).map((r) => {
      const existing = local.find((s) => s.id === r.id);
      const assessmentData = (r.assessment_data as AssessmentData | null) ?? {
        studentName: r.nombre ?? "",
        studentAge: r.edad ?? "",
        sensorial: { visualImpairment: "none", hearingImpairment: "none", motorSkills: "typical", assistiveTech: [] },
        neurodivergence: { attention: false, hyperactivity: false, socialInteraction: false, anxiety: false, sensoryOverload: false, additionalNotes: "" },
        aiResponses: [],
      };
      return {
        id: r.id,
        name: (r.nombre ?? "Sin nombre").trim(),
        age: (r.edad ?? "").trim(),
        assessmentData,
        completedAt: r.completed_at ?? new Date().toISOString().split("T")[0],
        timeline: existing?.timeline ?? defaultTimeline,
        reportSnapshot: existing?.reportSnapshot,
      };
    });
    const localOnly = local.filter((s) => !fromSupabase.some((f) => f.id === s.id));
    const merged = [...fromSupabase, ...localOnly];
    setSavedStudents(merged);
    setStudents(merged);
  }, []);

  const updateTimeline = useCallback((studentId: string, timeline: TimelineEntry[]) => {
    updateStudentTimeline(studentId, timeline);
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, timeline } : s))
    );
  }, []);

  return (
    <StudentsContext.Provider
      value={{ students, addStudent, createDraftStudent, updateTimeline, refresh, refreshFromSupabase }}
    >
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentsContext);
  if (ctx === undefined) {
    throw new Error("useStudents must be used within StudentsProvider");
  }
  return ctx;
}
