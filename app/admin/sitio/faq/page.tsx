"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { FaqItem } from "@/lib/landing/get-faq";
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
  { href: "/admin/sitio/faq", label: "FAQ" },
];

export default function AdminSitioFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sitio/faq");
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

  async function patchItem(id: string, patch: Partial<FaqItem>) {
    const res = await fetch(`/api/admin/sitio/faq/${id}`, {
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
    if (!pregunta.trim()) return;
    const res = await fetch("/api/admin/sitio/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta, respuesta }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al agregar");
      return;
    }
    setPregunta("");
    setRespuesta("");
    await load();
  }

  async function moveItem(id: string, direction: "up" | "down") {
    const index = items.findIndex((i) => i.id === id);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const a = items[index];
    const b = items[swapIndex];
    await Promise.all([patchItem(a.id, { orden: b.orden }), patchItem(b.id, { orden: a.orden })]);
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin" className="underline">
            Admin
          </Link>{" "}
          / Sitio web / FAQ
        </p>
        <h1 className="text-3xl font-bold">Preguntas frecuentes</h1>
        <p className="mt-2 text-muted-foreground">
          Edita las preguntas y respuestas.{" "}
          <a href="/preguntas-frecuentes/" target="_blank" rel="noopener noreferrer" className="underline">
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
          <CardTitle>Nueva pregunta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleAdd(e)} className="space-y-4">
            <div className="space-y-2">
              <Label>Pregunta</Label>
              <Input value={pregunta} onChange={(e) => setPregunta(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Respuesta</Label>
              <Textarea rows={3} value={respuesta} onChange={(e) => setRespuesta(e.target.value)} />
            </div>
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-base font-medium">{item.pregunta}</CardTitle>
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
                      if (confirm("¿Eliminar esta pregunta?")) {
                        void fetch(`/api/admin/sitio/faq/${item.id}`, { method: "DELETE" }).then(() => load());
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Pregunta</Label>
                  <Input
                    defaultValue={item.pregunta}
                    onBlur={(e) => {
                      if (e.target.value !== item.pregunta) void patchItem(item.id, { pregunta: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Respuesta</Label>
                  <Textarea
                    rows={3}
                    defaultValue={item.respuesta}
                    onBlur={(e) => {
                      if (e.target.value !== item.respuesta) void patchItem(item.id, { respuesta: e.target.value });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
