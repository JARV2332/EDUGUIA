"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Curso } from "@/lib/lms/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AlumnoRow {
  id: string;
  nombre: string | null;
  user_id: string;
  username?: string | null;
}

export default function AdminMatriculasPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoRow[]>([]);
  const [cursoId, setCursoId] = useState("");
  const [alumnoId, setAlumnoId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const [{ data: c }, { data: a }, { data: profiles }] = await Promise.all([
        supabase.from("cursos").select("id, titulo, slug, publicado").order("titulo"),
        supabase.from("alumnos").select("id, nombre, user_id").order("nombre"),
        supabase.from("profiles").select("id, username").eq("role", "estudiante"),
      ]);
      const usernameByUserId = new Map((profiles ?? []).map((p) => [p.id, p.username]));
      setCursos((c as Curso[]) ?? []);
      setAlumnos(
        ((a as AlumnoRow[]) ?? []).map((row) => ({
          ...row,
          username: usernameByUserId.get(row.user_id) ?? null,
        }))
      );
    };
    void load();
  }, []);

  const matricular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoId || !alumnoId) return;
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.from("matriculas").insert({
      curso_id: cursoId,
      alumno_id: alumnoId,
      estado: "activa",
    });
    setMessage(error ? error.message : "Estudiante matriculado correctamente.");
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Matrículas</h1>
        <p className="mt-2 text-muted-foreground">Inscribe estudiantes en los cursos del campus virtual.</p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Nueva matrícula</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void matricular(e)} className="space-y-4">
            <div className="space-y-2">
              <Label>Curso</Label>
              <Select value={cursoId} onValueChange={setCursoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estudiante</Label>
              <Select value={alumnoId} onValueChange={setAlumnoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {alumnos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.username ? `@${a.username}` : a.nombre || a.user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Matricular</Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
