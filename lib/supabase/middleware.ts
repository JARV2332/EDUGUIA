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

  if (isLandingPath(path) || path.startsWith("/auth/")) {
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

  const isDashboard = path.startsWith("/dashboard");
  const isAuthPage = path === "/login" || path === "/register" || path === "/forgot-password";
  const isPasswordRecovery = path === "/reset-password";

  if (isDashboard && !user) {
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("redirect", path);
    return NextResponse.redirect(redirect);
  }
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (isPasswordRecovery && !user) {
    return response;
  }

  return response;
}
