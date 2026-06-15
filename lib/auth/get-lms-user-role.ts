import type { SupabaseClient } from "@supabase/supabase-js";
import { isLmsRole, type LmsRole } from "@/lib/auth/lms-roles";

/** Rol en el campus EduKids (LMS). No confundir con EDUGUIA. */
export async function getLmsUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<LmsRole | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role && isLmsRole(profile.role)) {
    return profile.role;
  }

  const { data: instructor } = await supabase
    .from("instructores")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (instructor) return "lms_docente";

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (alumno) return "estudiante";

  return null;
}

export { getCampusHomeForRole } from "@/lib/auth/lms-roles";
