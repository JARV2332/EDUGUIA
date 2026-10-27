export type QuoteCopy = {
  descripcion: string;
  incluye: string;
  validez: string;
  notas: string;
};

const META_PREFIX = "EDUKIDS_QUOTE_META::";

export const DEFAULT_VALIDEZ = "15 días calendario";

export const DEFAULT_NOTAS = [
  "Precios expresados en quetzales (GTQ).",
  "La oferta es válida por el periodo indicado, sujeta a existencia en Electrónica DIY y a confirmación de EduKids GT.",
  "El detalle de materiales es referencial para armar el kit; puede haber equivalencias de marca o modelo si un ítem no está disponible.",
  "No incluye IVA ni facturación especial, salvo que se acuerde por escrito.",
  "Entrega, envío, armado o facilitación pedagógica se coordinan aparte y pueden cotizarse adicionalmente.",
].join("\n");

export function packQuoteCopy(copy: QuoteCopy): string {
  return `${META_PREFIX}${JSON.stringify({
    descripcion: copy.descripcion,
    incluye: copy.incluye,
    validez: copy.validez || DEFAULT_VALIDEZ,
    notas: copy.notas,
  })}`;
}

export function unpackQuoteCopy(raw: string | null | undefined): QuoteCopy {
  const text = raw?.trim() ?? "";
  if (text.startsWith(META_PREFIX)) {
    try {
      const parsed = JSON.parse(text.slice(META_PREFIX.length)) as Partial<QuoteCopy>;
      return {
        descripcion: parsed.descripcion?.trim() || "",
        incluye: parsed.incluye?.trim() || "",
        validez: parsed.validez?.trim() || DEFAULT_VALIDEZ,
        notas: parsed.notas?.trim() || DEFAULT_NOTAS,
      };
    } catch {
      /* fall through */
    }
  }
  return {
    descripcion: "",
    incluye: "",
    validez: DEFAULT_VALIDEZ,
    notas: text || DEFAULT_NOTAS,
  };
}

export function incluyeDesdeItems(lines: Array<{ cantidad: number; query: string; product?: { title?: string } | null }>) {
  return lines
    .map((line) => `• ${line.cantidad} × ${line.product?.title ?? line.query}`)
    .join("\n");
}
