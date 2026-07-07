import { getEduguiaHomePath } from "@/lib/auth/roles";
import { EDUGUIA_ROUTES, isEduguiaAuthPath } from "@/lib/auth/eduguia-routes";
import { getEduguiaUserRole } from "@/lib/auth/get-user-role";
import { getCampusHomeForRole, getLmsUserRole } from "@/lib/auth/get-lms-user-role";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rutas de la landing estática (sin auth). */
const LANDING_PATHS = new Set([
  "/",
  "/servicios",
  "/galeria",
  "/preguntas-frecuentes",
  "/comunicate-con-nosotros",
  "/portafolio",
  "/pestana",
]);

function isLandingPath(path: string): boolean {
  if (LANDING_PATHS.has(path)) return true;
  if (path.startsWith("/wp-content/") || path.startsWith("/assets/")) return true;
  if (path.endsWith(".html")) return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const isPublic =
    isLandingPath(path) ||
    path.startsWith("/auth/") ||
    path.startsWith("/share/") ||
    path === "/acceso" ||
    path === "/campus/login" ||
    path === "/campus/register";

  if (isPublic) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isEduguiaDashboard = path.startsWith("/dashboard");
  const isCampusDocente = path.startsWith("/campus/docente");
  const isAdmin = path.startsWith("/admin");
  const isAlumno = path.startsWith("/alumno");
  const isEduguiaAuth = isEduguiaAuthPath(path);
  const isPasswordRecovery = path === EDUGUIA_ROUTES.resetPassword || path === "/reset-password";

  const eduguiaRole = user ? await getEduguiaUserRole(supabase, user.id) : null;
  const lmsRole = user ? await getLmsUserRole(supabase, user.id) : null;
  const eduguiaHome = getEduguiaHomePath();
  const campusHome = lmsRole ? getCampusHomeForRole(lmsRole) : "/campus/login";

  if (isEduguiaDashboard && !user) {
    const redirect = new URL(EDUGUIA_ROUTES.login, request.url);
    redirect.searchParams.set("redirect", path);
    return NextResponse.redirect(redirect);
  }

  if (isEduguiaDashboard && user && !eduguiaRole) {
    return NextResponse.redirect(new URL(campusHome, request.url));
  }

  const isCampusProtected = isCampusDocente || isAdmin || isAlumno;
  if (isCampusProtected && !user) {
    const redirect = new URL("/campus/login", request.url);
    redirect.searchParams.set("redirect", path);
    return NextResponse.redirect(redirect);
  }

  if (user && lmsRole) {
    if (isAdmin && lmsRole !== "admin") {
      return NextResponse.redirect(new URL(campusHome, request.url));
    }
    if (isAlumno && lmsRole !== "estudiante") {
      return NextResponse.redirect(new URL(campusHome, request.url));
    }
    if (isCampusDocente && lmsRole !== "lms_docente") {
      return NextResponse.redirect(new URL(campusHome, request.url));
    }
  }

  if (isCampusProtected && user && !lmsRole) {
    return NextResponse.redirect(new URL(eduguiaHome, request.url));
  }

  if (user && eduguiaRole && isEduguiaAuth) {
    return NextResponse.redirect(new URL(eduguiaHome, request.url));
  }

  if (isPasswordRecovery && !user) {
    return response;
  }

  return response;
}
