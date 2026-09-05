import { jsPDF } from "jspdf";
import type { QuoteLine } from "@/lib/cotizaciones/types";
import { computeQuoteMoney, formatQ, formatQuoteNumber, lineSubtotal } from "@/lib/cotizaciones/totals";

export type QuotePdfInput = {
  numero?: number | null;
  titulo: string;
  cliente: string;
  leyenda: string;
  notas: string;
  items: QuoteLine[];
  precioVenta: number;
};

export function downloadQuotePdf(quote: QuotePdfInput) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 18;

  const costo = quote.items.reduce((sum, line) => sum + lineSubtotal(line), 0);
  const money = computeQuoteMoney(costo, quote.precioVenta);
  const folio = formatQuoteNumber(quote.numero);

  doc.setFillColor(14, 116, 144);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("EduKids GT", margin, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Cotización de kits de robótica", margin, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(folio, pageW - margin, 16, { align: "right" });

  y = 38;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(quote.titulo || "Kit de robótica", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Cliente: ${quote.cliente || "—"}`, margin, y);
  y += 5;
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-GT")}`, margin, y);
  y += 5;
  doc.setTextColor(100, 116, 139);
  doc.text("Precios de materiales: Electrónica DIY (Guatemala)", margin, y);
  y += 8;

  if (quote.leyenda.trim()) {
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Descripción del kit", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const legend = doc.splitTextToSize(quote.leyenda.trim(), pageW - margin * 2);
    doc.text(legend, margin, y);
    y += legend.length * 5 + 4;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageW - margin * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("Cant.", margin + 2, y + 5.5);
  doc.text("Material", margin + 18, y + 5.5);
  doc.text("P. unit.", pageW - 62, y + 5.5);
  doc.text("Subtotal", pageW - margin - 2, y + 5.5, { align: "right" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  for (const line of quote.items) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    const title = line.product?.title ?? `Pendiente: ${line.query}`;
    const titleLines = doc.splitTextToSize(title, pageW - 90);
    doc.text(String(line.cantidad), margin + 2, y);
    doc.text(titleLines, margin + 18, y);
    const unit = line.product?.price ?? 0;
    doc.text(formatQ(unit), pageW - 62, y);
    doc.text(formatQ(lineSubtotal(line)), pageW - margin - 2, y, { align: "right" });
    y += Math.max(7, titleLines.length * 5);
  }

  y += 6;
  const boxX = pageW - margin - 78;
  doc.setDrawColor(226, 232, 240);
  doc.rect(boxX, y, 78, 32);
  doc.setFontSize(10);
  doc.text("Costo materiales", boxX + 3, y + 7);
  doc.text(formatQ(money.costo), boxX + 75, y + 7, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text("Precio al cliente", boxX + 3, y + 15);
  doc.text(formatQ(money.precioVenta), boxX + 75, y + 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(money.ganancia >= 0 ? 22 : 185, money.ganancia >= 0 ? 163 : 28, money.ganancia >= 0 ? 74 : 28);
  doc.text("Ganancia", boxX + 3, y + 23);
  doc.text(`${formatQ(money.ganancia)}  (${money.margenPct.toFixed(1)}%)`, boxX + 75, y + 23, { align: "right" });

  y += 40;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  if (quote.notas.trim()) {
    doc.setFont("helvetica", "bold");
    doc.text("Notas", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const notes = doc.splitTextToSize(quote.notas.trim(), pageW - margin * 2);
    doc.text(notes, margin, y);
    y += notes.length * 4.5 + 4;
  }

  doc.setFontSize(8);
  doc.text(
    "Los precios de compra se consultan en electronicadiy.com. Sujetos a stock y cambios del proveedor.",
    margin,
    270
  );

  doc.save(`${folio}-${(quote.titulo || "kit").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
