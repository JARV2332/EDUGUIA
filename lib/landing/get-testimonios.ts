import { createClient } from "@supabase/supabase-js";

export type TestimonioItem = {
  id: string;
  nombre: string;
  rol: string;
  texto: string;
  orden: number;
  activo: boolean;
};

const FALLBACK_TESTIMONIOS: TestimonioItem[] = [
  {
    id: "t1",
    nombre: "María L.",
    rol: "Madre de alumno",
    texto:
      "Mi hijo llegó con curiosidad y hoy construye sus propios proyectos de robótica. EduKids despertó en él confianza para resolver problemas.",
    orden: 1,
    activo: true,
  },
  {
    id: "t2",
    nombre: "Carlos R.",
    rol: "Padre de familia",
    texto:
      "Los talleres combinan diversión y aprendizaje real. Se nota el método: los niños piensan, prueban y mejoran sus ideas en equipo.",
    orden: 2,
    activo: true,
  },
  {
    id: "t3",
    nombre: "Prof. Ana M.",
    rol: "Docente aliada",
    texto:
      "EduKids acompaña con materiales claros y un enfoque maker que facilita integrar STEAM en el aula con entusiasmo.",
    orden: 3,
    activo: true,
  },
];

export async function getPublicTestimonios(): Promise<TestimonioItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return FALLBACK_TESTIMONIOS;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from("landing_testimonios")
    .select("id, nombre, rol, texto, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error || !data?.length) return FALLBACK_TESTIMONIOS;
  return data as TestimonioItem[];
}
