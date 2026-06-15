/** Número de ventas EduKids GT (+502 5988 6915) */
export const WHATSAPP_VENTAS_NUMERO = "50259886915";

type CursoWhatsApp = {
  titulo: string;
  inversion?: string | null;
  duracion?: string | null;
  modalidad?: string | null;
};

export function buildComprarCursoWhatsAppUrl(curso: CursoWhatsApp): string {
  const lineas = [`Hola, estoy interesado en comprar el curso "${curso.titulo}".`, ""];

  if (curso.inversion) lineas.push(`Inversión: ${curso.inversion}`);
  else if (curso.duracion) lineas.push(`Duración: ${curso.duracion}`);

  if (curso.modalidad) lineas.push(`Modalidad: ${curso.modalidad}`);

  lineas.push("", "¿Podrían orientarme sobre la inscripción y formas de pago? ¡Gracias!");

  const text = encodeURIComponent(lineas.join("\n"));
  return `https://wa.me/${WHATSAPP_VENTAS_NUMERO}?text=${text}`;
}
