"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Curso } from "@/lib/lms/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DocenteLmsPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: docente } = await supabase.from("docentes").select("id").eq("user_id", user.id).single();
      if (!docente?.id) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("cursos")
        .select("*")
        .eq("docente_id", docente.id)
        .order("titulo");
      setCursos((data as Curso[]) ?? []);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Mis cursos LMS</h1>
        <p className="mt-2 text-muted-foreground">
          Cursos asignados donde puedes subir materiales, clases grabadas y tareas.
        </p>
      </header>

      {loading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : cursos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tienes cursos asignados. El administrador debe asignarte un curso.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cursos.map((curso) => (
            <Card key={curso.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{curso.titulo}</CardTitle>
                  <Badge variant={curso.publicado ? "default" : "secondary"}>
                    {curso.publicado ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
                <CardDescription>{curso.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/dashboard/lms/${curso.id}`}>Gestionar contenido</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
