export const runtime = "nodejs";

import { formatContactoNotificacion, validateContactForm, type ContactFormPayload } from "@/lib/landing/contact-form";
import { sendContactWhatsAppNotification } from "@/lib/landing/send-contact-whatsapp";

export async function POST(req: Request) {
  let body: Partial<ContactFormPayload>;

  try {
    body = (await req.json()) as Partial<ContactFormPayload>;
  } catch {
    return Response.json({ error: "Datos del formulario inválidos." }, { status: 400 });
  }

  const payload: ContactFormPayload = {
    name: String(body.name ?? ""),
    email: String(body.email ?? ""),
    phone: body.phone ? String(body.phone) : undefined,
    subject: String(body.subject ?? ""),
    message: String(body.message ?? ""),
  };

  const validationError = validateContactForm(payload);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const text = formatContactoNotificacion(payload);
  const result = await sendContactWhatsAppNotification(text);

  if (!result.ok) {
    console.error("[contact]", result.error);
    return Response.json(
      { error: "No pudimos enviar tu mensaje en este momento. Escríbenos directo por WhatsApp al 5988 6915." },
      { status: 503 }
    );
  }

  return Response.json({ ok: true });
}
