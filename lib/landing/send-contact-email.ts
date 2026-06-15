import { formatContactoNotificacion, type ContactFormPayload } from "@/lib/landing/contact-form";
import { CONTACT_SUBJECT_LABELS } from "@/lib/landing/whatsapp";

/** Envía correo de aviso (opcional). Requiere RESEND_API_KEY en el servidor. */
export async function sendContactEmailNotification(
  payload: ContactFormPayload
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, skipped: true };
  }

  const to = process.env.CONTACT_NOTIFY_EMAIL?.trim() || "info@edukidsgt.com";
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "EduKids GT <onboarding@resend.dev>";
  const motivo = CONTACT_SUBJECT_LABELS[payload.subject] ?? payload.subject;
  const text = formatContactoNotificacion(payload);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.email.trim(),
        subject: `Nuevo contacto EduKids — ${motivo} (${payload.name.trim()})`,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: body || "No se pudo enviar el correo." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Error de conexión al servicio de correo." };
  }
}
