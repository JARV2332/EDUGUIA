"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Curso, Matricula } from "@/lib/lms/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AlumnoHomePage() {
  const [matriculas, setMatriculas] = useState<(Matricula & { cursos: Curso })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: alumno } = await supabase.from("alumnos").select("id").eq("user_id", user.id).single();
      if (!alumno?.id) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("matriculas")
        .select("*, cursos(*)")
        .eq("alumno_id", alumno.id)
        .eq("estado", "activa");
      setMatriculas((data as (Matricula & { cursos: Curso })[]) ?? []);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Mis cursos</h1>
        <p className="mt-2 text-muted-foreground">
          Accede a clases, materiales y actividades de tus cursos matriculados.
        </p>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : matriculas.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Aún no estás matriculado en ningún curso.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Contacta a EduKids para inscribirte o visita{" "}
              <Link href="/comunicate-con-nosotros/" className="text-primary underline">
                Contacto
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matriculas.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{m.cursos.titulo}</CardTitle>
                  <Badge>Activo</Badge>
                </div>
                <CardDescription>{m.cursos.descripcion || "Curso EduKids"}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/alumno/cursos/${m.curso_id}`}>Entrar al curso</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
