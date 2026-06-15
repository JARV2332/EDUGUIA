export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { buildCatalogUpdate } from "@/lib/lms/admin-cursos";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const patch = buildCatalogUpdate(body);
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("cursos").update(patch).eq("id", id).select("*").single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ curso: data });
}
