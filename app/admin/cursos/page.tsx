"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Curso } from "@/lib/lms/types";
import { slugify } from "@/lib/lms/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function AdminCursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("cursos").select("*").order("created_at", { ascending: false });
    setCursos((data as Curso[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const slug = `${slugify(titulo)}-${Date.now().toString(36)}`;
    await supabase.from("cursos").insert({
      slug,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      publicado: false,
    });
    setTitulo("");
    setDescripcion("");
    setSaving(false);
    await load();
  };

  const togglePublicado = async (curso: Curso) => {
    const supabase = createClient();
    await supabase.from("cursos").update({ publicado: !curso.publicado }).eq("id", curso.id);
    await load();
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="mt-2 text-muted-foreground">Crea y administra el catálogo del campus virtual.</p>
        </div>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nuevo curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleCreate(e)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Creando…" : "Crear curso"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Cargando cursos…</p>
      ) : cursos.length === 0 ? (
        <p className="text-muted-foreground">Aún no hay cursos. Crea el primero arriba.</p>
      ) : (
        <ul className="space-y-3">
          {cursos.map((curso) => (
            <li key={curso.id}>
              <Card>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{curso.titulo}</h2>
                      <Badge variant={curso.publicado ? "default" : "secondary"}>
                        {curso.publicado ? "Publicado" : "Borrador"}
                      </Badge>
                    </div>
                    {curso.descripcion && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{curso.descripcion}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Switch checked={curso.publicado} onCheckedChange={() => void togglePublicado(curso)} />
                      <span>Publicar</span>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/cursos/${curso.id}`}>Contenido</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
