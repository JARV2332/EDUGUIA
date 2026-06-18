import { createClient } from "@supabase/supabase-js";

export type FaqItem = {
  id: string;
  pregunta: string;
  respuesta: string;
  orden: number;
  activo: boolean;
};

const FALLBACK_FAQ: FaqItem[] = [
  {
    id: "f1",
    pregunta: "¿Desde qué edad pueden participar?",
    respuesta:
      "Tenemos programas desde los 3 años en preescolar hasta adolescentes, según el curso. Revisa la ficha de cada taller en Servicios.",
    orden: 1,
    activo: true,
  },
  {
    id: "f2",
    pregunta: "¿Las clases son presenciales o virtuales?",
    respuesta:
      "Ofrecemos modalidades según el programa. Algunos cursos incluyen clases virtuales y opción de préstamo de materiales.",
    orden: 2,
    activo: true,
  },
  {
    id: "f3",
    pregunta: "¿Qué metodología utilizan?",
    respuesta:
      "Basamos el aprendizaje en el método científico y la cultura maker: los niños construyen, prueban y aprenden con autonomía.",
    orden: 3,
    activo: true,
  },
  {
    id: "f4",
    pregunta: "¿Cómo me inscribo?",
    respuesta: "Escríbenos por Contacto, WhatsApp o redes sociales y te guiamos en el proceso.",
    orden: 4,
    activo: true,
  },
];

export async function getPublicFaq(): Promise<FaqItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return FALLBACK_FAQ;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from("landing_faq")
    .select("id, pregunta, respuesta, orden, activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error || !data?.length) return FALLBACK_FAQ;
  return data as FaqItem[];
}

export async function getAdminFaq(supabase: ReturnType<typeof createClient>): Promise<FaqItem[]> {
  const { data, error } = await supabase
    .from("landing_faq")
    .select("id, pregunta, respuesta, orden, activo")
    .order("orden", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as FaqItem[];
}
