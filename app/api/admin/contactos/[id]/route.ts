export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireLmsAdmin(_request);
    if ("error" in auth) return auth.error;

    const { id } = await context.params;
    const { data, error } = await auth.supabase
      .from("contactos")
      .update({ leido: true })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ contacto: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al actualizar mensaje";
    return Response.json({ error: message }, { status: 500 });
  }
}
