"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Save } from "lucide-react";
import type { LandingHomeContent } from "@/lib/landing/get-home";
import { LANDING_HOME_FIELDS } from "@/lib/landing/get-home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELD_LABELS: Record<keyof LandingHomeContent, string> = {
  hero_bg_url: "Hero — imagen de fondo",
  hero_tagline: "Hero — frase superior",
  hero_headline: "Hero — titular principal",
  hero_logo_url: "Hero — logo (respaldo)",
  hero_text: "Hero — texto principal",
  hero_btn_text: "Hero — texto del botón",
  hero_btn_href: "Hero — enlace del botón",
  about_img_main: "Nosotros — imagen principal",
  about_img_secondary_1: "Nosotros — imagen secundaria 1",
  about_img_secondary_2: "Nosotros — imagen secundaria 2",
  about_paragraph_1: "Nosotros — párrafo 1",
  about_paragraph_2: "Nosotros — párrafo 2",
  enfoque_image_url: "Enfoque — imagen",
  enfoque_text: "Enfoque — texto",
  metodo_image_url: "Método — imagen",
  metodo_text: "Método — texto",
};

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/sitio/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleUpload(f);
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <ImagePlus className="mr-1 h-4 w-4" />
          {uploading ? "…" : "Subir"}
        </Button>
      </div>
      {value && <img src={value} alt="" className="max-h-24 rounded border object-cover" />}
    </div>
  );
}

export default function AdminSitioInicioPage() {
  const [content, setContent] = useState<LandingHomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/sitio/inicio");
    const data = await res.json();
    if (res.ok) setContent(data.content);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function setField(key: keyof LandingHomeContent, value: string) {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/sitio/inicio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Error al guardar");
      return;
    }
    setContent(data.content);
    setMessage("Cambios guardados.");
  }

  const imageFields: (keyof LandingHomeContent)[] = [
    "hero_bg_url",
    "hero_logo_url",
    "about_img_main",
    "about_img_secondary_1",
    "about_img_secondary_2",
    "enfoque_image_url",
    "metodo_image_url",
  ];

  const textAreas: (keyof LandingHomeContent)[] = [
    "hero_text",
    "about_paragraph_1",
    "about_paragraph_2",
    "enfoque_text",
    "metodo_text",
  ];

  const textFields: (keyof LandingHomeContent)[] = LANDING_HOME_FIELDS.filter(
    (k) => !imageFields.includes(k) && !textAreas.includes(k)
  );

  if (loading || !content) {
    return <div className="p-8 text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/admin" className="underline">
            Admin
          </Link>{" "}
          / Sitio web / Inicio
        </p>
        <h1 className="text-3xl font-bold">Página de inicio</h1>
        <p className="mt-2 text-muted-foreground">
          Edita hero, nosotros, enfoque y método.{" "}
          <a href="/" target="_blank" rel="noopener noreferrer" className="underline">
            Ver sitio
          </a>
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/sitio/galeria" className="underline">
            Galería
          </Link>
          <Link href="/admin/sitio/portafolio" className="underline">
            Portafolio
          </Link>
          <Link href="/admin/sitio/faq" className="underline">
            FAQ
          </Link>
          <Link href="/admin/sitio/contacto" className="underline">
            Redes y footer
          </Link>
        </div>
      </header>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contenido editable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {imageFields.map((key) => (
              <ImageField
                key={key}
                label={FIELD_LABELS[key]}
                value={content[key]}
                onChange={(v) => setField(key, v)}
              />
            ))}
            {textFields.map((key) => (
              <div key={key} className="space-y-2">
                <Label>{FIELD_LABELS[key]}</Label>
                <Input value={content[key]} onChange={(e) => setField(key, e.target.value)} />
              </div>
            ))}
            {textAreas.map((key) => (
              <div key={key} className="space-y-2">
                <Label>{FIELD_LABELS[key]}</Label>
                <Textarea rows={3} value={content[key]} onChange={(e) => setField(key, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {message && <p className="text-sm text-primary">{message}</p>}

        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
