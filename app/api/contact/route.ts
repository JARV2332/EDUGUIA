export const runtime = "nodejs";

import { validateContactForm, type ContactFormPayload } from "@/lib/landing/contact-form";
import { saveContacto } from "@/lib/landing/save-contacto";
import { sendContactEmailNotification } from "@/lib/landing/send-contact-email";

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

  const saved = await saveContacto(payload);
  if (!saved.ok) {
    console.error("[contact]", saved.error);
    return Response.json(
      { error: "No pudimos guardar tu mensaje. Intenta de nuevo o escríbenos por WhatsApp al 5988 6915." },
      { status: 503 }
    );
  }

  const emailed = await sendContactEmailNotification(payload);
  if (!emailed.ok && !emailed.skipped) {
    console.warn("[contact] email:", emailed.error);
  }

  return Response.json({ ok: true });
}
