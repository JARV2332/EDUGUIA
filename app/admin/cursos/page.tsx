"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import type { Curso } from "@/lib/lms/types";
import { formatEdadPublico, formatInversionLine } from "@/lib/lms/format-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const emptyCatalog = {
  titulo: "",
  descripcion: "",
  edad_min: "",
  edad_max: "",
  edad_publico: "",
  precio: "",
  duracion: "",
  modalidad: "",
  imagen_url: "",
  orden_servicios: "0",
};

type CatalogFormState = typeof emptyCatalog;

function CatalogFormFields({
  form,
  onChange,
  titleRequired,
}: {
  form: CatalogFormState;
  onChange: (patch: Partial<CatalogFormState>) => void;
  titleRequired?: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Título</Label>
        <Input value={form.titulo} onChange={(e) => onChange({ titulo: e.target.value })} required={titleRequired} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Descripción (aparece en /servicios)</Label>
        <Textarea rows={3} value={form.descripcion} onChange={(e) => onChange({ descripcion: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Edad mínima</Label>
        <Input type="number" min={0} value={form.edad_min} onChange={(e) => onChange({ edad_min: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Edad máxima</Label>
        <Input type="number" min={0} value={form.edad_max} onChange={(e) => onChange({ edad_max: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Texto de edad (opcional, reemplaza min/max)</Label>
        <Input
          placeholder="Ej. Niños y niñas desde 3 años"
          value={form.edad_publico}
          onChange={(e) => onChange({ edad_publico: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Precio (Q)</Label>
        <Input type="number" min={0} step="0.01" value={form.precio} onChange={(e) => onChange({ precio: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Duración</Label>
        <Input
          placeholder="Ej. 10 clases virtuales de 75 min"
          value={form.duracion}
          onChange={(e) => onChange({ duracion: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Modalidad</Label>
        <Input
          placeholder="Virtual, presencial, híbrido…"
          value={form.modalidad}
          onChange={(e) => onChange({ modalidad: e.target.value })}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>URL de imagen</Label>
        <Input
          placeholder="/wp-content/uploads/… o https://…"
          value={form.imagen_url}
          onChange={(e) => onChange({ imagen_url: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Orden en servicios</Label>
        <Input type="number" value={form.orden_servicios} onChange={(e) => onChange({ orden_servicios: e.target.value })} />
      </div>
    </>
  );
}

async function readApiError(res: Response) {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? `Error ${res.status}`;
}

export default function AdminCursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState(emptyCatalog);
  const [editCurso, setEditCurso] = useState<Curso | null>(null);
  const [editForm, setEditForm] = useState(emptyCatalog);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/cursos");
    if (!res.ok) {
      setError(await readApiError(res));
      setCursos([]);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { cursos?: Curso[] };
    setCursos(data.cursos ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.titulo.trim()) return;
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/cursos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });

    const data = (await res.json()) as { warning?: string; error?: string };
    if (!res.ok) {
      setError(data.error ?? (await readApiError(res)));
      setSaving(false);
      return;
    }

    setMessage(data.warning ?? "Curso creado correctamente.");
    setCreateForm(emptyCatalog);
    setSaving(false);
    await load();
  };

  const togglePublicado = async (curso: Curso) => {
    setError(null);
    setMessage(null);

    const res = await fetch(`/api/admin/cursos/${curso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: !curso.publicado }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? (await readApiError(res)));
      return;
    }

    setMessage(
      !curso.publicado
        ? `"${curso.titulo}" publicado — visible en /servicios`
        : `"${curso.titulo}" despublicado`
    );
    await load();
  };

  const openEdit = (curso: Curso) => {
    setEditCurso(curso);
    setEditForm({
      titulo: curso.titulo,
      descripcion: curso.descripcion ?? "",
      edad_min: curso.edad_min?.toString() ?? "",
      edad_max: curso.edad_max?.toString() ?? "",
      edad_publico: curso.edad_publico ?? "",
      precio: curso.precio?.toString() ?? "",
      duracion: curso.duracion ?? "",
      modalidad: curso.modalidad ?? "",
      imagen_url: curso.imagen_url ?? "",
      orden_servicios: curso.orden_servicios?.toString() ?? "0",
    });
  };

  const saveCatalog = async () => {
    if (!editCurso) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/cursos/${editCurso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? (await readApiError(res)));
      setSaving(false);
      return;
    }

    setMessage("Catálogo actualizado.");
    setSaving(false);
    setEditCurso(null);
    await load();
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="mt-2 text-muted-foreground">
            Al publicar un curso aparece en{" "}
            <a href="/servicios/" target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-1">
              /servicios <ExternalLink className="h-3.5 w-3.5" />
            </a>
            con precio, duración y edad.
          </p>
        </div>
      </header>

      {(error || message) && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            error ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/20 bg-primary/5 text-foreground"
          }`}
        >
          {error || message}
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nuevo curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleCreate(e)} className="grid gap-4 md:grid-cols-2">
            <CatalogFormFields
              form={createForm}
              onChange={(patch) => setCreateForm((f) => ({ ...f, ...patch }))}
              titleRequired
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Creando…" : "Crear curso"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Cargando cursos…</p>
      ) : cursos.length === 0 ? (
        <p className="text-muted-foreground">Aún no hay cursos. Crea el primero arriba.</p>
      ) : (
        <ul className="space-y-3">
          {cursos.map((curso) => {
            const edad = formatEdadPublico(curso);
            const inversion = formatInversionLine(curso);
            return (
              <li key={curso.id}>
                <Card>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{curso.titulo}</h2>
                        <Badge variant={curso.publicado ? "default" : "secondary"}>
                          {curso.publicado ? "Publicado" : "Borrador"}
                        </Badge>
                        {curso.publicado && <Badge variant="outline">Visible en servicios</Badge>}
                      </div>
                      {curso.descripcion && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{curso.descripcion}</p>
                      )}
                      {(edad || inversion) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[edad && `Edad: ${edad}`, inversion && `Inversión: ${inversion}`].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Switch checked={curso.publicado} onCheckedChange={() => void togglePublicado(curso)} />
                        <span>Publicar</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openEdit(curso)}>
                        Catálogo
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/cursos/${curso.id}`}>Contenido LMS</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={!!editCurso} onOpenChange={(open) => !open && setEditCurso(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Catálogo en /servicios</DialogTitle>
            <DialogDescription>
              Estos datos se muestran en la página pública cuando el curso está publicado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
            <CatalogFormFields form={editForm} onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))} titleRequired />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCurso(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveCatalog()} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
