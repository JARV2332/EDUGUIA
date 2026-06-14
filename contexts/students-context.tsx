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
  updateSavedStudent,
  setSavedStudents,
  buildAssessmentPayloadForDb,
  parseAssessmentPayloadFromDb,
  defaultTimeline,
  type SavedStudent,
  type AssessmentData,
  type TimelineEntry,
  type ReportSnapshot,
} from "@/lib/student-store";
import { createClient } from "@/lib/supabase/client";

function isSupabaseUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface StudentsContextType {
  students: SavedStudent[];
  addStudent: (
    data: AssessmentData,
    reportSnapshot?: ReportSnapshot,
    existingEstudianteId?: string
  ) => Promise<SavedStudent>;
  createDraftStudent: (data: AssessmentData) => Promise<string | null>;
  updateTimeline: (studentId: string, timeline: TimelineEntry[]) => Promise<void>;
  /** Actualiza datos locales y sincroniza con Supabase si el id es de la nube. */
  updateStudent: (
    studentId: string,
    patch: {
      assessmentData?: Partial<AssessmentData>;
      reportSnapshot?: ReportSnapshot;
      appendFollowUp?: { user: string; assistant: string };
    }
  ) => Promise<SavedStudent | undefined>;
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

  const syncStudentToSupabase = useCallback(async (student: SavedStudent) => {
    if (!isSupabaseUuid(student.id)) return;

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre: student.name,
          edad: student.age?.trim() || null,
          assessment_data: student.assessmentData,
          report_snapshot: student.reportSnapshot,
          timeline: student.timeline,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        console.error("Error sincronizando estudiante:", err.error ?? res.status);
      }
    } catch (e) {
      console.error("Error sincronizando estudiante:", e);
    }
  }, []);

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
        assessment_data: buildAssessmentPayloadForDb(data, undefined, defaultTimeline(completedAt)),
        completed_at: completedAt,
      })
      .select("id")
      .single();
    return error ? null : inserted?.id ?? null;
  }, []);

  const updateStudent = useCallback(
    async (
      studentId: string,
      patch: {
        assessmentData?: Partial<AssessmentData>;
        reportSnapshot?: ReportSnapshot;
        appendFollowUp?: { user: string; assistant: string };
      }
    ): Promise<SavedStudent | undefined> => {
      const current =
        getSavedStudents().find((s) => s.id === studentId) ??
        students.find((s) => s.id === studentId);
      if (!current) return undefined;

      let assessmentData = { ...current.assessmentData };

      if (patch.assessmentData) {
        assessmentData = { ...assessmentData, ...patch.assessmentData };
      }

      if (patch.appendFollowUp) {
        const log = [...(assessmentData.followUpLog ?? [])];
        log.push({
          ...patch.appendFollowUp,
          at: new Date().toISOString().split("T")[0],
        });
        assessmentData = { ...assessmentData, followUpLog: log };
      }

      const reportSnapshot =
        patch.reportSnapshot !== undefined ? patch.reportSnapshot : current.reportSnapshot;

      const updated = updateSavedStudent(studentId, {
        assessmentData,
        reportSnapshot,
        name: assessmentData.studentName?.trim() || current.name,
        age: assessmentData.studentAge?.trim() || current.age,
      });

      if (!updated) return undefined;

      setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)));
      await syncStudentToSupabase(updated);
      return updated;
    },
    [students, syncStudentToSupabase]
  );

  const addStudent = useCallback(
    async (
      data: AssessmentData,
      reportSnapshot?: ReportSnapshot,
      existingEstudianteId?: string
    ): Promise<SavedStudent> => {
      if (existingEstudianteId) {
        const saved = addSavedStudent(data, reportSnapshot, existingEstudianteId);
        setStudents((prev) => {
          const without = prev.filter((s) => s.id !== existingEstudianteId);
          return [saved, ...without];
        });
        await syncStudentToSupabase(saved);
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
              assessment_data: buildAssessmentPayloadForDb(
                data,
                reportSnapshot,
                defaultTimeline(completedAt)
              ),
              completed_at: completedAt,
            })
            .select("id")
            .single();
          if (!error && inserted?.id) {
            const saved = addSavedStudent(data, reportSnapshot, inserted.id);
            setStudents((prev) => [saved, ...prev]);
            await syncStudentToSupabase(saved);
            return saved;
          }
        }
      }
      const saved = addSavedStudent(data, reportSnapshot);
      setStudents((prev) => [saved, ...prev]);
      return saved;
    },
    [syncStudentToSupabase]
  );

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

    const fromSupabase: SavedStudent[] = (rows ?? []).map((r) => {
      const existing = local.find((s) => s.id === r.id);
      const completedAt = r.completed_at ?? new Date().toISOString().split("T")[0];
      const { assessmentData, reportSnapshot: fromDb, timeline: timelineFromDb, hasTimelineInDb } =
        parseAssessmentPayloadFromDb(r.assessment_data);
      if (!assessmentData.studentName && r.nombre) {
        assessmentData.studentName = r.nombre;
      }
      if (!assessmentData.studentAge && r.edad) {
        assessmentData.studentAge = r.edad;
      }

      const initialTimeline = defaultTimeline(completedAt);

      const timeline = hasTimelineInDb
        ? (timelineFromDb ?? [])
        : existing?.timeline?.length
          ? existing.timeline
          : initialTimeline;

      return {
        id: r.id,
        name: (r.nombre ?? assessmentData.studentName ?? "Sin nombre").trim(),
        age: (r.edad ?? assessmentData.studentAge ?? "").trim(),
        assessmentData,
        completedAt,
        timeline,
        reportSnapshot: fromDb ?? existing?.reportSnapshot,
      };
    });

    const localOnly = local.filter((s) => !fromSupabase.some((f) => f.id === s.id));
    const merged = [...fromSupabase, ...localOnly];
    setSavedStudents(merged);
    setStudents(merged);

    for (const student of fromSupabase) {
      const existing = local.find((s) => s.id === student.id);
      const { hasTimelineInDb } = parseAssessmentPayloadFromDb(
        rows?.find((row) => row.id === student.id)?.assessment_data
      );
      if (!hasTimelineInDb && existing?.timeline?.length) {
        await syncStudentToSupabase(student);
      }
    }
  }, [syncStudentToSupabase]);

  const updateTimeline = useCallback(
    async (studentId: string, timeline: TimelineEntry[]) => {
      updateStudentTimeline(studentId, timeline);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, timeline } : s)));
      const student = getSavedStudents().find((s) => s.id === studentId);
      if (student) {
        await syncStudentToSupabase({ ...student, timeline });
      }
    },
    [syncStudentToSupabase]
  );

  return (
    <StudentsContext.Provider
      value={{
        students,
        addStudent,
        createDraftStudent,
        updateTimeline,
        updateStudent,
        refresh,
        refreshFromSupabase,
      }}
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
