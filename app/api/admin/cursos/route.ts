export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { buildCreatePayload, buildMinimalCreatePayload } from "@/lib/lms/admin-cursos";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("cursos").select("*").order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ cursos: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const fullPayload = buildCreatePayload(body);
    let { data, error } = await admin.from("cursos").insert(fullPayload).select("*").single();

    let warning: string | null = null;
    if (error?.message?.includes("column")) {
      const minimal = buildMinimalCreatePayload(body);
      const retry = await admin.from("cursos").insert(minimal).select("*").single();
      data = retry.data;
      error = retry.error;
      if (!error) {
        warning = "Curso creado. Ejecuta la migración 006 en Supabase para precio, duración e imagen.";
      }
    }

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ curso: data, warning });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear curso";
    return Response.json({ error: message }, { status: 400 });
  }
}
