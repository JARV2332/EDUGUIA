export const runtime = "nodejs";

import { createClient } from "@supabase/supabase-js";
import { campusUsernameToEmail, isValidCampusUsername, normalizeCampusUsername } from "@/lib/auth/campus-username";

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

export async function GET() {
  const supabase = publicClient();
  if (!supabase) {
    return Response.json({ error: "Supabase no configurado", ready: false, hasAdmin: false }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("has_campus_admin");
  if (error) {
    return Response.json({
      ready: false,
      hasAdmin: false,
      needsSql: true,
      error: "Falta aplicar el SQL del proyecto nuevo en Supabase.",
    });
  }

  return Response.json({ ready: true, hasAdmin: Boolean(data) });
}

export async function POST(request: Request) {
  const supabase = publicClient();
  if (!supabase) {
    return Response.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const { data: exists, error: existsError } = await supabase.rpc("has_campus_admin");
  if (existsError) {
    return Response.json(
      { error: "Primero pega y ejecuta supabase/NEW_PROJECT.sql en el SQL Editor de Supabase." },
      { status: 409 }
    );
  }
  if (exists) {
    return Response.json({ error: "Ya existe un administrador. Entra por /campus/login." }, { status: 409 });
  }

  let body: { username?: unknown; password?: unknown; nombre?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const username = normalizeCampusUsername(typeof body.username === "string" ? body.username : "");
  const password = typeof body.password === "string" ? body.password : "";
  const nombre = typeof body.nombre === "string" && body.nombre.trim() ? body.nombre.trim() : "Administrador";

  if (!isValidCampusUsername(username)) {
    return Response.json({ error: "Usuario inválido (3-32, letras, números, . _ -)" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({
    email: campusUsernameToEmail(username),
    password,
    options: {
      data: {
        app: "edukids_lms",
        role: "admin",
        username,
        nombre,
      },
    },
  });

  if (error || !data.user) {
    return Response.json({ error: error?.message ?? "No se pudo crear el admin" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    username,
    hint: "Si no puedes entrar, en Supabase → Authentication → Providers → Email desactiva Confirm email.",
  });
}
