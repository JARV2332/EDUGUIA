export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import type { PortafolioImagen } from "@/lib/landing/get-portafolio";

function normalizeImagenes(raw: unknown): PortafolioImagen[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const url = typeof row.url === "string" ? row.url.trim() : "";
      const alt = typeof row.alt === "string" ? row.alt.trim() : "";
      if (!url) return null;
      return { url, alt };
    })
    .filter((item): item is PortafolioImagen => item !== null);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  let body: Partial<{
    etiqueta: string;
    titulo: string;
    descripcion: string;
    imagenes: PortafolioImagen[];
    orden: number;
    activo: boolean;
  }>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.etiqueta !== undefined) patch.etiqueta = body.etiqueta.trim();
  if (body.titulo !== undefined) patch.titulo = body.titulo.trim();
  if (body.descripcion !== undefined) patch.descripcion = body.descripcion.trim();
  if (body.orden !== undefined) patch.orden = body.orden;
  if (body.activo !== undefined) patch.activo = body.activo;
  const imagenes = normalizeImagenes(body.imagenes);
  if (imagenes !== undefined) patch.imagenes = imagenes;

  const { data, error } = await auth.supabase
    .from("landing_portafolio")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ item: data });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const { error } = await auth.supabase.from("landing_portafolio").delete().eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
