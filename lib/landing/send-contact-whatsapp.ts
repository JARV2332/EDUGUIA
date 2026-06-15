import { WHATSAPP_EDUKIDS_NUMERO } from "@/lib/landing/whatsapp";

/** Envía un WhatsApp al número EduKids vía CallMeBot (invisible para quien llena el formulario). */
export async function sendContactWhatsAppNotification(text: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.CALLMEBOT_API_KEY?.trim();
  const phone = process.env.EDUKIDS_WHATSAPP_PHONE?.trim() || WHATSAPP_EDUKIDS_NUMERO;

  if (!apiKey) {
    return { ok: false, error: "WhatsApp de contacto no configurado en el servidor." };
  }

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", apiKey);

  try {
    const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    const body = (await response.text()).trim();

    if (!response.ok) {
      return { ok: false, error: body || "No se pudo enviar el WhatsApp." };
    }

    if (/error/i.test(body)) {
      return { ok: false, error: body };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Error de conexión al servicio de WhatsApp." };
  }
}
