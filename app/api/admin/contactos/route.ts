export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";

export async function GET(request: Request) {
  try {
    const auth = await requireLmsAdmin(request);
    if ("error" in auth) return auth.error;

    const { data, error } = await auth.supabase
      .from("contactos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ contactos: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar mensajes";
    return Response.json({ error: message }, { status: 500 });
  }
}
