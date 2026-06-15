import { createClient } from "@/lib/supabase/route-handler";
import { getLmsUserRole } from "@/lib/auth/get-lms-user-role";
import type { SupabaseClient } from "@supabase/supabase-js";

type AdminResult =
  | { supabase: SupabaseClient; user: { id: string } }
  | { error: Response };

export async function requireLmsAdmin(request: Request): Promise<AdminResult> {
  const supabase = createClient(request);
  if (!supabase) {
    return { error: Response.json({ error: "Supabase no configurado" }, { status: 500 }) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: Response.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const role = await getLmsUserRole(supabase, user.id);
  if (role !== "admin") {
    return { error: Response.json({ error: "Solo administradores del campus" }, { status: 403 }) };
  }

  return { supabase, user: { id: user.id } };
}
