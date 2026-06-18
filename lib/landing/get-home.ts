import { createClient } from "@supabase/supabase-js";

export type LandingHomeContent = {
  hero_bg_url: string;
  hero_tagline: string;
  hero_logo_url: string;
  hero_text: string;
  hero_btn_text: string;
  hero_btn_href: string;
  about_img_main: string;
  about_img_secondary_1: string;
  about_img_secondary_2: string;
  about_paragraph_1: string;
  about_paragraph_2: string;
  enfoque_image_url: string;
  enfoque_text: string;
  metodo_image_url: string;
  metodo_text: string;
};

const DEFAULT_HOME: LandingHomeContent = {
  hero_bg_url: "/wp-content/uploads/2021/09/slider1-2-min.jpg",
  hero_tagline: "Educación para todos los niños",
  hero_logo_url: "/assets/logo-edukids.png",
  hero_text:
    "Nuestro método educativo está basado en el método científico, de manera que se motiva al alumno a mejorar su autonomía y pensamiento crítico.",
  hero_btn_text: "Leer más",
  hero_btn_href: "#nosotros",
  about_img_main: "/wp-content/uploads/2021/09/imagen-2_optimized.png",
  about_img_secondary_1: "/wp-content/uploads/2021/09/imagen-3_optimized.png",
  about_img_secondary_2: "/wp-content/uploads/2021/09/imagen-1_optimized-3.png",
  about_paragraph_1:
    "EDUKIDS es una empresa guatemalteca que cree firmemente en el potencial de cada guatemalteco. Preparamos a niñas y niños mediante la robótica para un mundo tecnológico y digital; ellos se involucran en su propio proceso de aprendizaje y potencian habilidades en áreas STEAM.",
  about_paragraph_2:
    "Enseñamos robótica educativa integrando electrónica y programación a niños y jóvenes de 4 a 17 años, apostando por su desarrollo como personas y profesionales del siglo XXI.",
  enfoque_image_url: "/wp-content/uploads/2019/08/portfolio-1a.jpg",
  enfoque_text:
    "Desarrollar la inteligencia y creatividad, fomentar el trabajo en equipo y resolver problemas con división de tareas. Los niños identifican los mejores componentes para cada reto, desarrollan habilidades sociales y refuerzan su autoestima.",
  metodo_image_url: "/wp-content/uploads/2021/09/LOGO-EDU-KIDS.png",
  metodo_text:
    "Nuestro método se basa en el método científico: se motiva al alumno a mejorar su autonomía y pensamiento crítico, dejando que marquen los objetivos reales de los proyectos. Ensayan el método de prueba y error para estimular autonomía y confianza.",
};

export async function getPublicHome(): Promise<LandingHomeContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return DEFAULT_HOME;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.from("landing_home").select("*").eq("id", 1).maybeSingle();

  if (error || !data) return DEFAULT_HOME;
  return { ...DEFAULT_HOME, ...data } as LandingHomeContent;
}

export const LANDING_HOME_FIELDS: (keyof LandingHomeContent)[] = [
  "hero_bg_url",
  "hero_tagline",
  "hero_logo_url",
  "hero_text",
  "hero_btn_text",
  "hero_btn_href",
  "about_img_main",
  "about_img_secondary_1",
  "about_img_secondary_2",
  "about_paragraph_1",
  "about_paragraph_2",
  "enfoque_image_url",
  "enfoque_text",
  "metodo_image_url",
  "metodo_text",
];
