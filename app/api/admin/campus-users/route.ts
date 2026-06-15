export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import {
  campusUsernameToEmail,
  isValidCampusUsername,
  normalizeCampusUsername,
} from "@/lib/auth/campus-username";
import { isLmsRole, type LmsRole } from "@/lib/auth/lms-roles";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const roleParam = new URL(request.url).searchParams.get("role");
  const roles: LmsRole[] =
    roleParam && isLmsRole(roleParam) && roleParam !== "admin"
      ? [roleParam]
      : ["estudiante", "lms_docente"];

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("id, nombre, username, role, created_at")
    .in("role", roles)
    .order("nombre", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ users: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  let body: {
    nombre?: string;
    username?: string;
    password?: string;
    role?: string;
    cursoId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const nombre = body.nombre?.trim();
  const username = normalizeCampusUsername(body.username ?? "");
  const password = body.password ?? "";
  const role = body.role as LmsRole | undefined;

  if (!nombre) {
    return Response.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  if (!isValidCampusUsername(username)) {
    return Response.json(
      { error: "Usuario inválido (3–32 caracteres: letras, números, . _ -)" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }
  if (!role || (role !== "estudiante" && role !== "lms_docente")) {
    return Response.json({ error: "Rol inválido (estudiante o lms_docente)" }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: "Ese usuario ya existe" }, { status: 409 });
  }

  const email = campusUsernameToEmail(username);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      app: "edukids_lms",
      role,
      nombre,
      username,
    },
  });

  if (createError || !created.user) {
    return Response.json({ error: createError?.message ?? "No se pudo crear la cuenta" }, { status: 500 });
  }

  await admin
    .from("profiles")
    .update({ username, nombre })
    .eq("id", created.user.id);

  let matriculaError: string | null = null;
  if (role === "estudiante" && body.cursoId) {
    const { data: alumno } = await admin
      .from("alumnos")
      .select("id")
      .eq("user_id", created.user.id)
      .single();

    if (alumno?.id) {
      const { error: matError } = await admin.from("matriculas").insert({
        curso_id: body.cursoId,
        alumno_id: alumno.id,
        estado: "activa",
      });
      if (matError) matriculaError = matError.message;
    }
  }

  return Response.json({
    user: {
      id: created.user.id,
      nombre,
      username,
      role,
      loginEmail: email,
    },
    matriculaError,
  });
}
