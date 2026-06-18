"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import type { LandingContacto } from "@/lib/landing/get-contacto";
import { LANDING_CONTACTO_FIELDS } from "@/lib/landing/get-contacto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELD_LABELS: Record<keyof LandingContacto, string> = {
  facebook_url: "URL de Facebook",
  instagram_url: "URL de Instagram",
  whatsapp_url: "URL de WhatsApp",
  footer_text: "Texto del footer",
  copyright_text: "Texto de copyright",
};

const SITIO_LINKS = [
  { href: "/admin/sitio/inicio", label: "Inicio" },
  { href: "/admin/sitio/galeria", label: "Galería" },
  { href: "/admin/sitio/portafolio", label: "Portafolio" },
  { href: "/admin/sitio/faq", label: "FAQ" },
  { href: "/admin/sitio/contacto", label: "Redes y footer" },
];

export default function AdminSitioContactoPage() {
  const [content, setContent] = useState<LandingContacto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/sitio/contacto");
    const data = await res.json();
    if (res.ok) setContent(data.content);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function setField(key: keyof LandingContacto, value: string) {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/sitio/contacto", {
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
          / Sitio web / Redes y footer
        </p>
        <h1 className="text-3xl font-bold">Redes y contacto</h1>
        <p className="mt-2 text-muted-foreground">
          Enlaces de redes sociales y textos del pie de página en todas las páginas del sitio.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {SITIO_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="underline">
              {l.label}
            </Link>
          ))}
        </div>
      </header>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enlaces y textos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {LANDING_CONTACTO_FIELDS.map((key) =>
              key === "footer_text" || key === "copyright_text" ? (
                <div key={key} className="space-y-2">
                  <Label>{FIELD_LABELS[key]}</Label>
                  <Textarea rows={2} value={content[key]} onChange={(e) => setField(key, e.target.value)} />
                </div>
              ) : (
                <div key={key} className="space-y-2">
                  <Label>{FIELD_LABELS[key]}</Label>
                  <Input value={content[key]} onChange={(e) => setField(key, e.target.value)} />
                </div>
              )
            )}
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
