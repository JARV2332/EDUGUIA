"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { CONTACT_SUBJECT_LABELS, WHATSAPP_EDUKIDS_NUMERO } from "@/lib/landing/whatsapp";
import type { ContactoRow } from "@/lib/landing/save-contacto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildReplyWhatsAppUrl(contacto: ContactoRow): string | null {
  if (!contacto.telefono?.trim()) return null;
  const digits = contacto.telefono.replace(/\D/g, "");
  if (digits.length < 8) return null;

  const motivo = CONTACT_SUBJECT_LABELS[contacto.motivo] ?? contacto.motivo;
  const text = encodeURIComponent(
    [
      `Hola ${contacto.nombre}, gracias por escribirnos desde EduKids GT.`,
      "",
      `Recibimos tu consulta sobre: ${motivo}.`,
      "",
      "¿En qué podemos ayudarte?",
    ].join("\n")
  );

  return `https://wa.me/${digits}?text=${text}`;
}

export default function AdminContactosPage() {
  const [contactos, setContactos] = useState<ContactoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/contactos");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los mensajes");
      setContactos(data.contactos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    const res = await fetch(`/api/admin/contactos/${id}`, { method: "PATCH" });
    if (!res.ok) return;
    setContactos((prev) => prev.map((c) => (c.id === id ? { ...c, leido: true } : c)));
  }

  const unread = contactos.filter((c) => !c.leido).length;

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mensajes de contacto</h1>
          <p className="mt-2 text-muted-foreground">
            Formulario de la web. Los visitantes no ven WhatsApp ni correo al enviar.
          </p>
        </div>
        {unread > 0 && <Badge variant="secondary">{unread} sin leer</Badge>}
      </header>

      {loading && <p className="text-muted-foreground">Cargando…</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && contactos.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aún no hay mensajes del formulario de contacto.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {contactos.map((contacto) => {
          const whatsappReply = buildReplyWhatsAppUrl(contacto);
          const motivo = CONTACT_SUBJECT_LABELS[contacto.motivo] ?? contacto.motivo;

          return (
            <Card key={contacto.id} className={contacto.leido ? "opacity-80" : "border-primary/40"}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{contacto.nombre}</CardTitle>
                    <CardDescription>{formatDate(contacto.created_at)}</CardDescription>
                  </div>
                  {!contacto.leido && <Badge>Nuevo</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  <strong>Motivo:</strong> {motivo}
                </p>
                <p className="whitespace-pre-wrap text-sm">{contacto.mensaje}</p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <a className="underline" href={`mailto:${contacto.email}`}>
                      {contacto.email}
                    </a>
                  </span>
                  {contacto.telefono && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {contacto.telefono}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {!contacto.leido && (
                    <Button size="sm" variant="outline" onClick={() => markRead(contacto.id)}>
                      Marcar leído
                    </Button>
                  )}
                  {whatsappReply && (
                    <Button size="sm" asChild>
                      <a href={whatsappReply} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Responder por WhatsApp
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" asChild>
                    <a href={`mailto:${contacto.email}?subject=Re: ${encodeURIComponent(motivo)}`}>Responder por correo</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        WhatsApp EduKids: +{WHATSAPP_EDUKIDS_NUMERO.slice(0, 3)} {WHATSAPP_EDUKIDS_NUMERO.slice(3)}
      </p>
    </div>
  );
}
