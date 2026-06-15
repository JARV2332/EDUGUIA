"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Video } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Curso, Material, Modulo, Tarea } from "@/lib/lms/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function AlumnoCursoPage() {
  const params = useParams();
  const cursoId = params.id as string;
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [materiales, setMateriales] = useState<Record<string, Material[]>>({});
  const [tareas, setTareas] = useState<Record<string, Tarea[]>>({});
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [entregaTexto, setEntregaTexto] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: alumno } = await supabase.from("alumnos").select("id").eq("user_id", user.id).single();
      setAlumnoId(alumno?.id ?? null);

      const { data: cursoData } = await supabase.from("cursos").select("*").eq("id", cursoId).single();
      setCurso(cursoData as Curso);

      const { data: mods } = await supabase
        .from("modulos")
        .select("*")
        .eq("curso_id", cursoId)
        .order("orden", { ascending: true });
      const modList = (mods as Modulo[]) ?? [];
      setModulos(modList);

      const matMap: Record<string, Material[]> = {};
      const tarMap: Record<string, Tarea[]> = {};
      for (const mod of modList) {
        const { data: mats } = await supabase.from("materiales").select("*").eq("modulo_id", mod.id);
        matMap[mod.id] = (mats as Material[]) ?? [];
        const { data: tars } = await supabase.from("tareas").select("*").eq("modulo_id", mod.id);
        tarMap[mod.id] = (tars as Tarea[]) ?? [];
      }
      setMateriales(matMap);
      setTareas(tarMap);
    };
    void load();
  }, [cursoId]);

  const submitTarea = async (tareaId: string) => {
    if (!alumnoId) return;
    const contenido = entregaTexto[tareaId]?.trim();
    if (!contenido) return;
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.from("entregas").upsert(
      {
        tarea_id: tareaId,
        alumno_id: alumnoId,
        contenido,
        estado: "enviada",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "tarea_id,alumno_id" }
    );
    setMessage(error ? error.message : "Tarea enviada correctamente.");
  };

  if (!curso) {
    return <div className="p-8 text-muted-foreground">Cargando curso…</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/alumno">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Mis cursos
        </Link>
      </Button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{curso.titulo}</h1>
        <p className="mt-2 text-muted-foreground">{curso.descripcion}</p>
      </header>

      {message && <p className="mb-4 text-sm text-primary">{message}</p>}

      <div className="space-y-6">
        {modulos.map((mod) => (
          <Card key={mod.id}>
            <CardHeader>
              <CardTitle>{mod.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Materiales y clases
                </h3>
                <ul className="space-y-2">
                  {(materiales[mod.id] ?? []).map((mat) => (
                    <li key={mat.id} className="flex items-start gap-3 rounded-lg border p-3">
                      {mat.tipo === "video" ? (
                        <Video className="mt-0.5 h-5 w-5 text-primary" />
                      ) : (
                        <FileText className="mt-0.5 h-5 w-5 text-secondary" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{mat.titulo}</p>
                        <Badge variant="outline" className="mt-1">
                          {mat.tipo}
                        </Badge>
                        {mat.url && (
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener"
                            className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline"
                          >
                            Abrir material
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {mat.contenido && <p className="mt-2 text-sm text-muted-foreground">{mat.contenido}</p>}
                      </div>
                    </li>
                  ))}
                  {(materiales[mod.id] ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin materiales aún.</p>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Actividades / tareas
                </h3>
                <ul className="space-y-3">
                  {(tareas[mod.id] ?? []).map((tarea) => (
                    <li key={tarea.id} className="rounded-lg border p-3">
                      <p className="font-medium">{tarea.titulo}</p>
                      {tarea.instrucciones && (
                        <p className="mt-1 text-sm text-muted-foreground">{tarea.instrucciones}</p>
                      )}
                      <Textarea
                        className="mt-3"
                        placeholder="Escribe tu respuesta o comentarios…"
                        value={entregaTexto[tarea.id] ?? ""}
                        onChange={(e) =>
                          setEntregaTexto((prev) => ({ ...prev, [tarea.id]: e.target.value }))
                        }
                      />
                      <Button className="mt-2" size="sm" onClick={() => void submitTarea(tarea.id)}>
                        Enviar tarea
                      </Button>
                    </li>
                  ))}
                  {(tareas[mod.id] ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin tareas asignadas.</p>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
        {modulos.length === 0 && (
          <p className="text-muted-foreground">El docente aún no ha publicado contenido en este curso.</p>
        )}
      </div>
    </div>
  );
}
