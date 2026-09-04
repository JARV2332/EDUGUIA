export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { pickBestProduct, searchElectronicadiy } from "@/lib/cotizaciones/electronicadiy";
import { parseNeedsWithAi } from "@/lib/cotizaciones/parse-needs";
import type { QuoteLine } from "@/lib/cotizaciones/types";

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const slice = items.slice(i, i + limit);
    const mapped = await Promise.all(slice.map((item, offset) => mapper(item, i + offset)));
    out.push(...mapped);
  }
  return out;
}

export async function POST(request: Request) {
  try {
    const auth = await requireLmsAdmin(request);
    if ("error" in auth) return auth.error;

    let body: { prompt?: unknown; margenPct?: unknown };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "JSON inválido" }, { status: 400 });
    }

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (prompt.length < 8) {
      return Response.json({ error: "Describe el paquete o los materiales que necesitas." }, { status: 400 });
    }

    const margenPct = Number(body.margenPct);
    const parsed = await parseNeedsWithAi(prompt);
    if (!parsed.items.length) {
      return Response.json(
        { error: "No pude extraer materiales. Prueba con: 10 Arduino UNO, 20 LEDs, protoboard" },
        { status: 400 }
      );
    }

    const items = await mapLimit(parsed.items, 3, async (need, index): Promise<QuoteLine> => {
      const { products } = await searchElectronicadiy(need.query, 8);
      return {
        id: `line-${Date.now()}-${index}`,
        query: need.query,
        cantidad: need.cantidad,
        notas: need.notas,
        product: pickBestProduct(products, need.query),
        alternatives: products,
      };
    });

    return Response.json({
      titulo: parsed.titulo,
      cliente: parsed.cliente,
      notas: parsed.notas,
      margenPct: Number.isFinite(margenPct) ? margenPct : 0,
      items,
      usedAi: parsed.usedAi,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo generar la cotización";
    return Response.json({ error: message }, { status: 500 });
  }
}
