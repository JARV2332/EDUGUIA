import { createClient } from "@supabase/supabase-js";

export type GaleriaItem = {
  id: string;
  imagen_url: string;
  alt_text: string;
  orden: number;
  activo: boolean;
};

const FALLBACK_GALERIA: GaleriaItem[] = [
  { id: "f1", imagen_url: "/wp-content/uploads/2021/09/imagen-2_optimized.png", alt_text: "Actividad EduKids", orden: 1, activo: true },
  { id: "f2", imagen_url: "/wp-content/uploads/2021/09/imagen-3_optimized.png", alt_text: "Taller de robótica", orden: 2, activo: true },
  { id: "f3", imagen_url: "/wp-content/uploads/2021/09/imagen-1_optimized-3.png", alt_text: "Proyecto STEAM", orden: 3, activo: true },
];

export async function getPublicGaleria(): Promise<GaleriaItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return FALLBACK_GALERIA;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from("landing_galeria")
    .select("id, imagen_url, alt_text, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error || !data?.length) return FALLBACK_GALERIA;
  return data as GaleriaItem[];
}

export async function getAdminGaleria(supabase: ReturnType<typeof createClient>): Promise<GaleriaItem[]> {
  const { data, error } = await supabase
    .from("landing_galeria")
    .select("id, imagen_url, alt_text, orden, activo")
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as GaleriaItem[];
}

export function publicStorageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !path) return path;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${base}/storage/v1/object/public/landing-media/${path}`;
}
