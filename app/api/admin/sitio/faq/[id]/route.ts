export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  let body: Partial<{ pregunta: string; respuesta: string; orden: number; activo: boolean }>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.pregunta !== undefined) patch.pregunta = body.pregunta.trim();
  if (body.respuesta !== undefined) patch.respuesta = body.respuesta.trim();
  if (body.orden !== undefined) patch.orden = body.orden;
  if (body.activo !== undefined) patch.activo = body.activo;

  const { data, error } = await auth.supabase.from("landing_faq").update(patch).eq("id", id).select("*").single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ item: data });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const { error } = await auth.supabase.from("landing_faq").delete().eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
