export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { formatEdadPublico, formatInversionLine, cursoImagenDefault } from "@/lib/lms/format-catalog";
import type { Curso } from "@/lib/lms/types";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ cursos: [], error: "Supabase no configurado" }, { status: 503 });
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.from("cursos").select("*").eq("publicado", true);

  if (error) {
    return Response.json({ error: error.message, cursos: [] }, { status: 500 });
  }

  const rows = (data as Curso[]) ?? [];
  const sorted = [...rows].sort((a, b) => {
    const orderA = a.orden_servicios ?? 0;
    const orderB = b.orden_servicios ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.titulo ?? "").localeCompare(b.titulo ?? "", "es");
  });

  const cursos = sorted.map((curso) => ({
    id: curso.id,
    slug: curso.slug,
    titulo: curso.titulo,
    descripcion: curso.descripcion,
    edad: formatEdadPublico(curso),
    inversion: formatInversionLine(curso),
    duracion: curso.duracion ?? null,
    precio: curso.precio ?? null,
    precio_moneda: curso.precio_moneda ?? "GTQ",
    modalidad: curso.modalidad ?? null,
    imagen_url: curso.imagen_url || cursoImagenDefault(),
  }));

  return Response.json(
    { cursos },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}
