import { createClient } from "@supabase/supabase-js";
import type { ContactFormPayload } from "@/lib/landing/contact-form";

export type ContactoRow = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  motivo: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
};

export async function saveContacto(payload: ContactFormPayload): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { ok: false, error: "Base de datos no configurada." };
  }

  const supabase = createClient(url, anonKey);
  const { error } = await supabase.from("contactos").insert({
    nombre: payload.name.trim(),
    email: payload.email.trim(),
    telefono: payload.phone?.trim() || null,
    motivo: payload.subject.trim(),
    mensaje: payload.message.trim(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
