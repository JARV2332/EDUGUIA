"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Curso, Material, Modulo, Tarea } from "@/lib/lms/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CampusDocenteCursoPage() {
  const params = useParams();
  const cursoId = params.id as string;
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [materiales, setMateriales] = useState<Record<string, Material[]>>({});
  const [tareas, setTareas] = useState<Record<string, Tarea[]>>({});
  const [moduloTitulo, setModuloTitulo] = useState("");
  const [selectedModulo, setSelectedModulo] = useState("");
  const [materialTitulo, setMaterialTitulo] = useState("");
  const [materialTipo, setMaterialTipo] = useState<Material["tipo"]>("video");
  const [materialUrl, setMaterialUrl] = useState("");
  const [tareaTitulo, setTareaTitulo] = useState("");

  const load = async () => {
    const supabase = createClient();
    const { data: cursoData } = await supabase.from("cursos").select("*").eq("id", cursoId).single();
    setCurso(cursoData as Curso);
    const { data: mods } = await supabase
      .from("modulos")
      .select("*")
      .eq("curso_id", cursoId)
      .order("orden", { ascending: true });
    const modList = (mods as Modulo[]) ?? [];
    setModulos(modList);
    if (modList.length && !selectedModulo) setSelectedModulo(modList[0].id);
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

  useEffect(() => {
    void load();
  }, [cursoId]);

  const addModulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduloTitulo.trim()) return;
    const supabase = createClient();
    await supabase.from("modulos").insert({ curso_id: cursoId, titulo: moduloTitulo.trim(), orden: modulos.length });
    setModuloTitulo("");
    await load();
  };

  const addMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModulo || !materialTitulo.trim()) return;
    const supabase = createClient();
    await supabase.from("materiales").insert({
      modulo_id: selectedModulo,
      titulo: materialTitulo.trim(),
      tipo: materialTipo,
      url: materialUrl.trim() || null,
      orden: materiales[selectedModulo]?.length ?? 0,
    });
    setMaterialTitulo("");
    setMaterialUrl("");
    await load();
  };

  const addTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModulo || !tareaTitulo.trim()) return;
    const supabase = createClient();
    await supabase.from("tareas").insert({ modulo_id: selectedModulo, titulo: tareaTitulo.trim() });
    setTareaTitulo("");
    await load();
  };

  if (!curso) return <div className="p-8 text-muted-foreground">Cargando…</div>;

  return (
    <div className="p-6 lg:p-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/campus/docente">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Mis cursos
        </Link>
      </Button>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{curso.titulo}</h1>
        <p className="mt-2 text-muted-foreground">Sube clases grabadas, materiales y tareas para tus alumnos.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Módulos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => void addModulo(e)} className="flex gap-2">
              <Input value={moduloTitulo} onChange={(e) => setModuloTitulo(e.target.value)} placeholder="Nueva clase o módulo" />
              <Button type="submit"><Plus className="h-4 w-4" /></Button>
            </form>
            <ul className="space-y-2">
              {modulos.map((mod) => (
                <li key={mod.id}>
                  <button type="button" className={`w-full rounded-lg border p-3 text-left ${selectedModulo === mod.id ? "border-primary bg-primary/5" : ""}`} onClick={() => setSelectedModulo(mod.id)}>
                    {mod.titulo}
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contenido del módulo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {modulos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Crea un módulo primero.</p>
            ) : (
              <>
                <form onSubmit={(e) => void addMaterial(e)} className="space-y-3 rounded-lg border p-3">
                  <Label>Material / clase grabada</Label>
                  <Input value={materialTitulo} onChange={(e) => setMaterialTitulo(e.target.value)} placeholder="Título" />
                  <Select value={materialTipo} onValueChange={(v) => setMaterialTipo(v as Material["tipo"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="link">Enlace</SelectItem>
                      <SelectItem value="actividad">Actividad</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} placeholder="URL del video o archivo" />
                  <Button type="submit" size="sm">Agregar</Button>
                </form>
                <form onSubmit={(e) => void addTarea(e)} className="space-y-3 rounded-lg border p-3">
                  <Label>Tarea</Label>
                  <Input value={tareaTitulo} onChange={(e) => setTareaTitulo(e.target.value)} placeholder="Título de la tarea" />
                  <Button type="submit" size="sm" variant="secondary">Agregar tarea</Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
