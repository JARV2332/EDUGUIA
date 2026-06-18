export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { getAdminFaq } from "@/lib/landing/get-faq";

export async function GET(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const items = await getAdminFaq(auth.supabase);
    return Response.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar FAQ";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  let body: { pregunta?: string; respuesta?: string; orden?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const pregunta = body.pregunta?.trim();
  if (!pregunta) {
    return Response.json({ error: "Indica la pregunta." }, { status: 400 });
  }

  const { data: maxRow } = await auth.supabase
    .from("landing_faq")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const orden = body.orden ?? (maxRow?.orden ?? 0) + 1;

  const { data, error } = await auth.supabase
    .from("landing_faq")
    .insert({
      pregunta,
      respuesta: body.respuesta?.trim() || "",
      orden,
      activo: true,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ item: data });
}
