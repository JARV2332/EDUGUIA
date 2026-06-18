export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { getAdminGaleria } from "@/lib/landing/get-galeria";

export async function GET(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const items = await getAdminGaleria(auth.supabase);
    return Response.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar galería";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  let body: { imagen_url?: string; alt_text?: string; orden?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const imagen_url = body.imagen_url?.trim();
  if (!imagen_url) {
    return Response.json({ error: "Indica la URL de la imagen." }, { status: 400 });
  }

  const { data: maxRow } = await auth.supabase
    .from("landing_galeria")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const orden = body.orden ?? (maxRow?.orden ?? 0) + 1;

  const { data, error } = await auth.supabase
    .from("landing_galeria")
    .insert({
      imagen_url,
      alt_text: body.alt_text?.trim() || "Foto EduKids",
      orden,
      activo: true,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ item: data });
}
