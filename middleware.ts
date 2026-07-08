import { type NextRequest, NextResponse } from "next/server";
import { isEdukidsPublicPath } from "@/lib/constants/edukids-routes";
import { ISABEL_APP_URL } from "@/lib/constants/isabel";
import { updateSession } from "@/lib/supabase/middleware";

const EDUGUIA_PAUSED_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>EDUGUIA — Mantenimiento</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
    main { text-align: center; padding: 2rem; max-width: 28rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { line-height: 1.6; color: #475569; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <main>
    <h1>EDUGUIA en pausa temporal</h1>
    <p>Estamos realizando ajustes para optimizar el servicio. Volveremos pronto.</p>
    <p><a href="/">Volver a EduKids</a> · <a href="${ISABEL_APP_URL}">ISABEL</a></p>
  </main>
</body>
</html>`;

/** EDUGUIA/campus/admin pausados por defecto. Solo EduKids público activo. */
function isEduguiaPaused(): boolean {
  return process.env.EDUGUIA_ENABLED !== "true";
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (isEduguiaPaused() && !isEdukidsPublicPath(path)) {
    return new NextResponse(EDUGUIA_PAUSED_HTML, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "86400",
        "Cache-Control": "no-store",
      },
    });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|wp-content|assets|ISABEL(?:/.*)?|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2|woff|ttf|html)$).*)",
  ],
};
