export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { getPublicHome, LANDING_HOME_FIELDS, type LandingHomeContent } from "@/lib/landing/get-home";

export async function GET(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const content = await getPublicHome();
  return Response.json({ content });
}

export async function PATCH(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  let body: Partial<LandingHomeContent>;
  try {
    body = (await request.json()) as Partial<LandingHomeContent>;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  for (const key of LANDING_HOME_FIELDS) {
    const value = body[key];
    if (typeof value === "string") patch[key] = value.trim();
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "Nada que actualizar" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("landing_home")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ content: data });
}
