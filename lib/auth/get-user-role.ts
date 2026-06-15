import type { SupabaseClient } from "@supabase/supabase-js";
import { type EduguiaRole } from "@/lib/auth/roles";
import { getLmsUserRole } from "@/lib/auth/get-lms-user-role";

/** ¿Tiene acceso a EDUGUIA? Solo docentes de inclusión, no cuentas del campus EduKids. */
export async function getEduguiaUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<EduguiaRole | null> {
  const lmsRole = await getLmsUserRole(supabase, userId);
  if (lmsRole) return null;

  const { data: docente } = await supabase
    .from("docentes")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (docente) return "docente";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role === "docente") return "docente";

  return null;
}
