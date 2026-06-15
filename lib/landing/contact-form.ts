import { CONTACT_SUBJECT_LABELS } from "@/lib/landing/whatsapp";

export type ContactFormPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export function validateContactForm(data: ContactFormPayload): string | null {
  const name = data.name?.trim();
  const email = data.email?.trim();
  const subject = data.subject?.trim();
  const message = data.message?.trim();

  if (!name || name.length < 2) return "Indica tu nombre completo.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Indica un correo válido.";
  if (!subject) return "Selecciona un motivo de contacto.";
  if (!message || message.length < 10) return "Escribe un mensaje de al menos 10 caracteres.";

  return null;
}

export function formatContactoNotificacion(data: ContactFormPayload): string {
  const motivo = CONTACT_SUBJECT_LABELS[data.subject] ?? data.subject;
  const lineas = [
    "📩 Nuevo contacto — formulario EduKids GT",
    "",
    `Nombre: ${data.name.trim()}`,
    `Correo: ${data.email.trim()}`,
  ];

  const phone = data.phone?.trim();
  if (phone) lineas.push(`Teléfono: ${phone}`);

  lineas.push(`Motivo: ${motivo}`, "", "Mensaje:", data.message.trim());

  return lineas.join("\n");
}
