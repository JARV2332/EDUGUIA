import type { QuoteLine } from "@/lib/cotizaciones/types";

export function lineSubtotal(line: QuoteLine): number {
  return (line.product?.price ?? 0) * line.cantidad;
}

export function costoFromItems(items: QuoteLine[]): number {
  return items.reduce((sum, line) => sum + lineSubtotal(line), 0);
}

export function computeQuoteMoney(costo: number, precioVenta: number) {
  const ganancia = precioVenta - costo;
  const margenPct = costo > 0 ? (ganancia / costo) * 100 : 0;
  return { costo, precioVenta, ganancia, margenPct };
}

export function ventaDesdeMargen(costo: number, margenPct: number): number {
  return costo * (1 + margenPct / 100);
}

export function formatQ(value: number) {
  return `Q${value.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatQuoteNumber(numero?: number | null) {
  if (!numero) return "COT-BORRADOR";
  return `COT-${String(numero).padStart(4, "0")}`;
}
