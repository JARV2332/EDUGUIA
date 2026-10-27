import { jsPDF } from "jspdf";
import type { QuoteLine } from "@/lib/cotizaciones/types";
import { formatQ, formatQuoteNumber } from "@/lib/cotizaciones/totals";

export type QuotePdfInput = {
  numero?: number | null;
  titulo: string;
  cliente: string;
  leyenda: string;
  descripcion?: string;
  incluye?: string;
  validez?: string;
  notas: string;
  items: QuoteLine[];
  precioVenta: number;
};

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/assets/logo-edukids.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed < pageH - 22) return y;
  doc.addPage();
  return 18;
}

export async function downloadQuotePdf(quote: QuotePdfInput) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const inner = pageW - margin * 2;
  let y = 14;

  const folio = formatQuoteNumber(quote.numero);
  const today = new Date();
  const fecha = today.toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" });
  const logo = await loadLogoDataUrl();

  doc.setFillColor(8, 47, 73);
  doc.rect(0, 0, pageW, 36, "F");
  if (logo) {
    doc.addImage(logo, "PNG", margin, 7, 28, 22);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("EduKids GT", logo ? margin + 32 : margin, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Robótica educativa y STEAM · Guatemala", logo ? margin + 32 : margin, 22);
  doc.text("www.edukidsgt.com", logo ? margin + 32 : margin, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(folio, pageW - margin, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("COTIZACIÓN", pageW - margin, 22, { align: "right" });
  doc.text(fecha, pageW - margin, 27, { align: "right" });

  y = 46;
  doc.setTextColor(15, 23, 42);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, inner, 22, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("CLIENTE", margin + 4, y + 6);
  doc.text("VÁLIDA", margin + inner / 2, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(quote.cliente || "Por definir", margin + 4, y + 14);
  doc.text(quote.validez || "15 días calendario", margin + inner / 2, y + 14);
  y += 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(quote.titulo || "Kit de robótica", margin, y);
  y += 8;

  const bloques = [
    { title: "Leyenda / alcance", body: quote.leyenda },
    { title: "Descripción comercial", body: quote.descripcion && quote.descripcion !== quote.leyenda ? quote.descripcion : "" },
    { title: "El kit incluye", body: quote.incluye },
  ].filter((block) => block.body?.trim());

  for (const block of bloques) {
    y = ensureSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(14, 116, 144);
    doc.text(block.title.toUpperCase(), margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(block.body!.trim(), inner);
    for (const line of lines) {
      y = ensureSpace(doc, y, 6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;
  }

  y = ensureSpace(doc, y, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(14, 116, 144);
  doc.text("DETALLE DE MATERIALES", margin, y);
  y += 4;

  doc.setFillColor(8, 47, 73);
  doc.rect(margin, y, inner, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("#", margin + 2, y + 5.5);
  doc.text("Descripción", margin + 10, y + 5.5);
  doc.text("Cantidad", pageW - margin - 2, y + 5.5, { align: "right" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  quote.items.forEach((line, index) => {
    const title = line.product?.title ?? `Pendiente de confirmar: ${line.query}`;
    const titleLines = doc.splitTextToSize(title, inner - 36);
    const rowH = Math.max(8, titleLines.length * 4.5 + 3);
    y = ensureSpace(doc, y, rowH);
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3, inner, rowH, "F");
    }
    doc.setFontSize(8);
    doc.text(String(index + 1), margin + 2, y + 2);
    doc.text(titleLines, margin + 10, y + 2);
    doc.text(String(line.cantidad), pageW - margin - 2, y + 2, { align: "right" });
    y += rowH;
  });

  y = ensureSpace(doc, y, 36);
  y += 4;
  const boxW = 92;
  const boxX = pageW - margin - boxW;
  doc.setFillColor(8, 47, 73);
  doc.roundedRect(boxX, y, boxW, 28, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text("INVERSIÓN TOTAL DEL KIT", boxX + 4, y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(formatQ(quote.precioVenta), boxX + boxW - 4, y + 20, { align: "right" });
  y += 34;

  if (quote.notas.trim()) {
    y = ensureSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(14, 116, 144);
    doc.text("CONDICIONES", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const notes = doc.splitTextToSize(quote.notas.trim(), inner);
    for (const line of notes) {
      y = ensureSpace(doc, y, 5);
      doc.text(line, margin, y);
      y += 4.5;
    }
  }

  doc.setFillColor(8, 47, 73);
  doc.rect(0, pageH - 14, pageW, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("EduKids GT · Cotización generada para uso comercial · Precios de materiales: electronicadiy.com", margin, pageH - 6);

  doc.save(`${folio}-${(quote.titulo || "kit").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
