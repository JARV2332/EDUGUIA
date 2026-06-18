import { createClient } from "@supabase/supabase-js";

export type PortafolioImagen = { url: string; alt: string };

export type PortafolioItem = {
  id: string;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  imagenes: PortafolioImagen[];
  orden: number;
  activo: boolean;
};

const FALLBACK_PORTAFOLIO: PortafolioItem[] = [
  {
    id: "f1",
    etiqueta: "Robótica educativa",
    titulo: "Construcción y programación",
    descripcion:
      "Los estudiantes diseñan y programan robots con componentes electrónicos, aplicando el método científico y trabajando en equipo para resolver retos reales.",
    imagenes: [
      { url: "/wp-content/uploads/2019/08/portfolio-1a.jpg", alt: "Proyecto robótica 1" },
      { url: "/wp-content/uploads/2019/08/portfolio-1b.jpg", alt: "Proyecto robótica 2" },
      { url: "/wp-content/uploads/2019/08/portfolio-1c.jpg", alt: "Proyecto robótica 3" },
    ],
    orden: 1,
    activo: true,
  },
  {
    id: "f2",
    etiqueta: "Programación creativa",
    titulo: "Videojuegos con Scratch",
    descripcion:
      "Desarrollo de juegos propios mientras aprenden lógica, bucles, variables y diseño — fortaleciendo creatividad y confianza en la tecnología.",
    imagenes: [
      { url: "/wp-content/uploads/2019/08/portfolio-2a.jpg", alt: "Proyecto videojuegos 1" },
      { url: "/wp-content/uploads/2019/08/portfolio-2b.jpg", alt: "Proyecto videojuegos 2" },
      { url: "/wp-content/uploads/2019/08/portfolio-2c.jpg", alt: "Proyecto videojuegos 3" },
      { url: "/wp-content/uploads/2019/08/portfolio-2d.jpg", alt: "Proyecto videojuegos 4" },
    ],
    orden: 2,
    activo: true,
  },
];

function normalizeImagenes(raw: unknown): PortafolioImagen[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const url = typeof row.url === "string" ? row.url : "";
      const alt = typeof row.alt === "string" ? row.alt : "";
      if (!url) return null;
      return { url, alt };
    })
    .filter((item): item is PortafolioImagen => item !== null);
}

function mapRow(row: Record<string, unknown>): PortafolioItem {
  return {
    id: String(row.id),
    etiqueta: String(row.etiqueta ?? ""),
    titulo: String(row.titulo ?? ""),
    descripcion: String(row.descripcion ?? ""),
    imagenes: normalizeImagenes(row.imagenes),
    orden: Number(row.orden ?? 0),
    activo: Boolean(row.activo ?? true),
  };
}

export async function getPublicPortafolio(): Promise<PortafolioItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return FALLBACK_PORTAFOLIO;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from("landing_portafolio")
    .select("id, etiqueta, titulo, descripcion, imagenes, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error || !data?.length) return FALLBACK_PORTAFOLIO;
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function getAdminPortafolio(supabase: ReturnType<typeof createClient>): Promise<PortafolioItem[]> {
  const { data, error } = await supabase
    .from("landing_portafolio")
    .select("id, etiqueta, titulo, descripcion, imagenes, orden, activo")
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}
