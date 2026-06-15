/** Número EduKids GT (+502 5988 6915) */
export const WHATSAPP_EDUKIDS_NUMERO = "50259886915";

export const CONTACT_SUBJECT_LABELS: Record<string, string> = {
  inscripcion: "Inscripción a cursos",
  informacion: "Información general",
  alianza: "Alianzas o colaboraciones",
  eduguia: "Consulta sobre EDUGUIA",
  otro: "Otro",
};

type CursoWhatsApp = {
  titulo: string;
  inversion?: string | null;
  duracion?: string | null;
  modalidad?: string | null;
};

function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_EDUKIDS_NUMERO}?text=${encodeURIComponent(text)}`;
}

export function buildComprarCursoWhatsAppUrl(curso: CursoWhatsApp): string {
  const lineas = [`Hola, estoy interesado en comprar el curso "${curso.titulo}".`, ""];

  if (curso.inversion) lineas.push(`Inversión: ${curso.inversion}`);
  else if (curso.duracion) lineas.push(`Duración: ${curso.duracion}`);

  if (curso.modalidad) lineas.push(`Modalidad: ${curso.modalidad}`);

  lineas.push("", "¿Podrían orientarme sobre la inscripción y formas de pago? ¡Gracias!");

  return buildWhatsAppUrl(lineas.join("\n"));
}
