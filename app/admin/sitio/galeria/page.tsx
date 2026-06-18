"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import type { GaleriaItem } from "@/lib/landing/get-galeria";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function AdminSitioGaleriaPage() {
  const [items, setItems] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sitio/galeria");
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

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/sitio/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    const res = await fetch("/api/admin/sitio/galeria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagen_url: imageUrl.trim(), alt_text: altText.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al agregar");
      return;
    }
    setAltText("");
    setImageUrl("");
    await load();
  }

  async function patchItem(id: string, patch: Partial<GaleriaItem>) {
    const res = await fetch(`/api/admin/sitio/galeria/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al guardar");
      return;
    }
    await load();
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    await Promise.all([
      patchItem(a.id, { orden: b.orden }),
      patchItem(b.id, { orden: a.orden }),
    ]);
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin" className="underline">
              Admin
            </Link>{" "}
            / Sitio web / Galería
          </p>
          <h1 className="text-3xl font-bold">Galería del sitio</h1>
          <p className="mt-2 text-muted-foreground">
            Sube fotos y ordénalas. Se muestran en{" "}
            <a href="/galeria/" target="_blank" rel="noopener noreferrer" className="underline">
              /galeria
            </a>
            .
          </p>
        </div>
      </header>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Agregar foto</CardTitle>
          <CardDescription>Sube una imagen o pega una URL existente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleAdd(e)} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              <Button type="button" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                <ImagePlus className="mr-2 h-4 w-4" />
                {uploading ? "Subiendo…" : "Subir imagen"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="galeria-url">URL de imagen</Label>
              <Input
                id="galeria-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://… o /wp-content/uploads/…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="galeria-alt">Texto alternativo</Label>
              <Input
                id="galeria-alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Descripción breve de la foto"
              />
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="" className="max-h-40 rounded-lg border object-cover" />
            )}
            <Button type="submit" disabled={!imageUrl.trim()}>
              Agregar a la galería
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="space-y-3 p-4">
                <img src={item.imagen_url} alt={item.alt_text} className="aspect-video w-full rounded-md object-cover" />
                <Input
                  value={item.alt_text}
                  onChange={(e) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, alt_text: e.target.value } : x)))}
                  onBlur={() => void patchItem(item.id, { alt_text: item.alt_text })}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={item.activo}
                      onCheckedChange={(checked) => void patchItem(item.id, { activo: checked })}
                    />
                    Visible
                  </label>
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="outline" disabled={index === 0} onClick={() => void moveItem(index, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={index === items.length - 1}
                      onClick={() => void moveItem(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("¿Eliminar esta foto?")) void fetch(`/api/admin/sitio/galeria/${item.id}`, { method: "DELETE" }).then(() => load());
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
