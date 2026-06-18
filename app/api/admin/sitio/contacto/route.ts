export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { getPublicContacto, LANDING_CONTACTO_FIELDS, type LandingContacto } from "@/lib/landing/get-contacto";

export async function GET(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const content = await getPublicContacto();
  return Response.json({ content });
}

export async function PATCH(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  let body: Partial<LandingContacto>;
  try {
    body = (await request.json()) as Partial<LandingContacto>;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  for (const key of LANDING_CONTACTO_FIELDS) {
    const value = body[key];
    if (typeof value === "string") patch[key] = value.trim();
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("landing_contacto")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ content: data });
}
