import type { SupabaseClient } from "@supabase/supabase-js";
import { getHomePathForRole, isUserRole, type UserRole } from "@/lib/auth/roles";

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role && isUserRole(profile.role)) {
    return profile.role;
  }

  const { data: docente } = await supabase
    .from("docentes")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (docente) return "docente";

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (alumno) return "estudiante";

  return "docente";
}

export { getHomePathForRole };
