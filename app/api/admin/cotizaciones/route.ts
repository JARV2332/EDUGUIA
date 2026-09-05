export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { computeQuoteMoney, costoFromItems } from "@/lib/cotizaciones/totals";
import type { QuoteLine } from "@/lib/cotizaciones/types";

function asItems(value: unknown): QuoteLine[] {
  return Array.isArray(value) ? (value as QuoteLine[]) : [];
}

export async function GET(request: Request) {
  try {
    const auth = await requireLmsAdmin(request);
    if ("error" in auth) return auth.error;

    const { data, error } = await auth.supabase
      .from("cotizaciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ cotizaciones: data ?? [], count: data?.length ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar cotizaciones";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireLmsAdmin(request);
    if ("error" in auth) return auth.error;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "JSON inválido" }, { status: 400 });
    }

    const items = asItems(body.items);
    const costo = costoFromItems(items);
    const precioVenta = Number(body.precioVenta);
    const money = computeQuoteMoney(costo, Number.isFinite(precioVenta) ? precioVenta : 0);

    const payload = {
      titulo: typeof body.titulo === "string" && body.titulo.trim() ? body.titulo.trim() : "Kit de robótica",
      cliente: typeof body.cliente === "string" ? body.cliente.trim() : "",
      leyenda: typeof body.leyenda === "string" ? body.leyenda.trim() : "",
      notas: typeof body.notas === "string" ? body.notas.trim() : "",
      estado: "borrador",
      costo: money.costo,
      precio_venta: money.precioVenta,
      ganancia: money.ganancia,
      margen_pct: Number(money.margenPct.toFixed(2)),
      items,
      created_by: auth.user.id,
    };

    const id = typeof body.id === "string" ? body.id : null;
    const query = id
      ? auth.supabase.from("cotizaciones").update(payload).eq("id", id).select("*").single()
      : auth.supabase.from("cotizaciones").insert(payload).select("*").single();

    const { data, error } = await query;
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ cotizacion: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al guardar cotización";
    return Response.json({ error: message }, { status: 500 });
  }
}
