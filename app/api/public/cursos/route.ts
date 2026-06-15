export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { formatEdadPublico, formatInversionLine, cursoImagenDefault } from "@/lib/lms/format-catalog";
import type { Curso } from "@/lib/lms/types";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ cursos: [] });
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from("cursos")
    .select(
      "id, slug, titulo, descripcion, edad_min, edad_max, edad_publico, imagen_url, precio, precio_moneda, duracion, modalidad, orden_servicios, publicado"
    )
    .eq("publicado", true)
    .order("orden_servicios", { ascending: true })
    .order("titulo", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const cursos = ((data as Curso[]) ?? []).map((curso) => ({
    id: curso.id,
    slug: curso.slug,
    titulo: curso.titulo,
    descripcion: curso.descripcion,
    edad: formatEdadPublico(curso),
    inversion: formatInversionLine(curso),
    duracion: curso.duracion,
    precio: curso.precio,
    precio_moneda: curso.precio_moneda,
    modalidad: curso.modalidad,
    imagen_url: curso.imagen_url || cursoImagenDefault(),
  }));

  return Response.json(
    { cursos },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
