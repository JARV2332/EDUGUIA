"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import type { PortafolioImagen, PortafolioItem } from "@/lib/landing/get-portafolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const SITIO_LINKS = [
  { href: "/admin/sitio/inicio", label: "Inicio" },
  { href: "/admin/sitio/galeria", label: "Galería" },
  { href: "/admin/sitio/portafolio", label: "Portafolio" },
];

function emptyProject(): Omit<PortafolioItem, "id" | "orden"> {
  return { etiqueta: "", titulo: "", descripcion: "", imagenes: [], activo: true };
}

export default function AdminSitioPortafolioPage() {
  const [items, setItems] = useState<PortafolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyProject());
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<{ mode: "draft" | "item"; itemId?: string; index: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sitio/portafolio");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar");
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/sitio/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al subir");
    return data.url as string;
  }

  function triggerUpload(target: { mode: "draft" | "item"; itemId?: string; index: number }) {
    uploadTargetRef.current = target;
    fileRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const target = uploadTargetRef.current;
    if (!file || !target) return;

    setUploadingIndex(target.index);
    setError(null);
    try {
      const url = await uploadFile(file);
      if (target.mode === "draft") {
        setDraft((prev) => {
          const imagenes = [...prev.imagenes];
          const row = imagenes[target.index] ?? { url: "", alt: "" };
          imagenes[target.index] = { ...row, url };
          return { ...prev, imagenes };
        });
      } else if (target.itemId) {
        const item = items.find((i) => i.id === target.itemId);
        if (!item) return;
        const imagenes = [...item.imagenes];
        const row = imagenes[target.index] ?? { url: "", alt: "" };
        imagenes[target.index] = { ...row, url };
        await patchItem(target.itemId, { imagenes });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploadingIndex(null);
    }
  }

  async function patchItem(id: string, patch: Partial<PortafolioItem>) {
    const res = await fetch(`/api/admin/sitio/portafolio/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al guardar");
      return;
    }
    await load();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.titulo.trim()) return;
    const res = await fetch("/api/admin/sitio/portafolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al agregar");
      return;
    }
    setDraft(emptyProject());
    await load();
  }

  async function moveItem(id: string, direction: "up" | "down") {
    const index = items.findIndex((i) => i.id === id);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const a = items[index];
    const b = items[swapIndex];
    await Promise.all([
      patchItem(a.id, { orden: b.orden }),
      patchItem(b.id, { orden: a.orden }),
    ]);
  }

  function ImagenEditor({
    imagenes,
    onChange,
    onUpload,
  }: {
    imagenes: PortafolioImagen[];
    onChange: (imagenes: PortafolioImagen[]) => void;
    onUpload: (index: number) => void;
  }) {
    return (
      <div className="space-y-3">
        <Label>Imágenes del proyecto</Label>
        {imagenes.map((img, index) => (
          <div key={index} className="flex flex-wrap items-start gap-2 rounded border p-3">
            <div className="flex-1 space-y-2 min-w-[200px]">
              <Input
                placeholder="URL"
                value={img.url}
                onChange={(e) => {
                  const next = [...imagenes];
                  next[index] = { ...next[index], url: e.target.value };
                  onChange(next);
                }}
              />
              <Input
                placeholder="Texto alternativo"
                value={img.alt}
                onChange={(e) => {
                  const next = [...imagenes];
                  next[index] = { ...next[index], alt: e.target.value };
                  onChange(next);
                }}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => onUpload(index)} disabled={uploadingIndex === index}>
              <ImagePlus className="mr-1 h-4 w-4" />
              Subir
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(imagenes.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {img.url && <img src={img.url} alt="" className="h-16 w-16 rounded object-cover" />}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...imagenes, { url: "", alt: "" }])}>
          <Plus className="mr-1 h-4 w-4" />
          Agregar imagen
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleFileChange(e)} />

      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin" className="underline">
            Admin
          </Link>{" "}
          / Sitio web / Portafolio
        </p>
        <h1 className="text-3xl font-bold">Portafolio</h1>
        <p className="mt-2 text-muted-foreground">
          Proyectos destacados de estudiantes.{" "}
          <a href="/portafolio/" target="_blank" rel="noopener noreferrer" className="underline">
            Ver sitio
          </a>
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {SITIO_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="underline">
              {l.label}
            </Link>
          ))}
        </div>
      </header>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Nuevo proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleAdd(e)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Etiqueta (h4)</Label>
                <Input value={draft.etiqueta} onChange={(e) => setDraft({ ...draft, etiqueta: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={draft.titulo} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea rows={3} value={draft.descripcion} onChange={(e) => setDraft({ ...draft, descripcion: e.target.value })} />
            </div>
            <ImagenEditor
              imagenes={draft.imagenes}
              onChange={(imagenes) => setDraft({ ...draft, imagenes })}
              onUpload={(index) => triggerUpload({ mode: "draft", index })}
            />
            <Button type="submit">Agregar proyecto</Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">{item.titulo || "Sin título"}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch checked={item.activo} onCheckedChange={(activo) => void patchItem(item.id, { activo })} />
                  <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => void moveItem(item.id, "up")}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === items.length - 1}
                    onClick={() => void moveItem(item.id, "down")}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("¿Eliminar este proyecto?")) {
                        void fetch(`/api/admin/sitio/portafolio/${item.id}`, { method: "DELETE" }).then(() => load());
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Etiqueta</Label>
                    <Input
                      defaultValue={item.etiqueta}
                      onBlur={(e) => {
                        if (e.target.value !== item.etiqueta) void patchItem(item.id, { etiqueta: e.target.value });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      defaultValue={item.titulo}
                      onBlur={(e) => {
                        if (e.target.value !== item.titulo) void patchItem(item.id, { titulo: e.target.value });
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    rows={3}
                    defaultValue={item.descripcion}
                    onBlur={(e) => {
                      if (e.target.value !== item.descripcion) void patchItem(item.id, { descripcion: e.target.value });
                    }}
                  />
                </div>
                <ImagenEditor
                  imagenes={item.imagenes}
                  onChange={(imagenes) => void patchItem(item.id, { imagenes })}
                  onUpload={(imgIndex) => triggerUpload({ mode: "item", itemId: item.id, index: imgIndex })}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
