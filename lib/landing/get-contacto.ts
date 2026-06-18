import { createClient } from "@supabase/supabase-js";

export type LandingContacto = {
  facebook_url: string;
  instagram_url: string;
  whatsapp_url: string;
  footer_text: string;
  copyright_text: string;
};

export const DEFAULT_CONTACTO: LandingContacto = {
  facebook_url: "https://www.facebook.com/edukidsguatemala/",
  instagram_url: "https://www.instagram.com/edukids_gt/",
  whatsapp_url: "https://wa.me/50259886915",
  footer_text: "Educación en robótica y STEAM para niños y jóvenes en Guatemala.",
  copyright_text: "© 2026 EduKidsGt — Todos los derechos reservados.",
};

export const LANDING_CONTACTO_FIELDS = [
  "facebook_url",
  "instagram_url",
  "whatsapp_url",
  "footer_text",
  "copyright_text",
] as const satisfies readonly (keyof LandingContacto)[];

export async function getPublicContacto(): Promise<LandingContacto> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return DEFAULT_CONTACTO;

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.from("landing_contacto").select(LANDING_CONTACTO_FIELDS.join(", ")).eq("id", 1).maybeSingle();

  if (error || !data) return DEFAULT_CONTACTO;
  return { ...DEFAULT_CONTACTO, ...(data as LandingContacto) };
}
