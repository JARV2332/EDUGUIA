import { createClient } from "@supabase/supabase-js";
import { formatEdadPublico, formatInversionLine, cursoImagenDefault } from "@/lib/lms/format-catalog";
import type { Curso } from "@/lib/lms/types";

export type PublicCursoCard = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  edad: string | null;
  inversion: string | null;
  duracion: string | null;
  modalidad: string | null;
  imagen_url: string;
};

export async function getPublicCursos(): Promise<PublicCursoCard[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.from("cursos").select("*").eq("publicado", true);
  if (error) return [];

  const rows = (data as Curso[]) ?? [];
  const sorted = [...rows].sort((a, b) => {
    const orderA = a.orden_servicios ?? 0;
    const orderB = b.orden_servicios ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.titulo ?? "").localeCompare(b.titulo ?? "", "es");
  });

  return sorted.map((curso) => ({
    id: curso.id,
    slug: curso.slug,
    titulo: curso.titulo,
    descripcion: curso.descripcion,
    edad: formatEdadPublico(curso),
    inversion: formatInversionLine(curso),
    duracion: curso.duracion ?? null,
    modalidad: curso.modalidad ?? null,
    imagen_url: curso.imagen_url || cursoImagenDefault(),
  }));
}
