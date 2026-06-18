export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { getAdminPortafolio, type PortafolioImagen } from "@/lib/landing/get-portafolio";

function normalizeImagenes(raw: unknown): PortafolioImagen[] {
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

export async function GET(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const items = await getAdminPortafolio(auth.supabase);
    return Response.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar portafolio";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  let body: {
    etiqueta?: string;
    titulo?: string;
    descripcion?: string;
    imagenes?: PortafolioImagen[];
    orden?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const titulo = body.titulo?.trim();
  if (!titulo) {
    return Response.json({ error: "Indica el título del proyecto." }, { status: 400 });
  }

  const { data: maxRow } = await auth.supabase
    .from("landing_portafolio")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const orden = body.orden ?? (maxRow?.orden ?? 0) + 1;

  const { data, error } = await auth.supabase
    .from("landing_portafolio")
    .insert({
      etiqueta: body.etiqueta?.trim() || "",
      titulo,
      descripcion: body.descripcion?.trim() || "",
      imagenes: normalizeImagenes(body.imagenes),
      orden,
      activo: true,
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ item: data });
}
