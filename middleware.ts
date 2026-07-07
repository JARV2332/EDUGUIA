import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const MAINTENANCE_HTML = `<!DOCTYPE html>
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
  </style>
</head>
<body>
  <main>
    <h1>EDUGUIA en pausa temporal</h1>
    <p>Estamos realizando ajustes para optimizar el servicio. Volveremos pronto.</p>
    <p><a href="https://isabel-lake.vercel.app/ISABEL">ISABEL</a> sigue disponible en su sitio.</p>
  </main>
</body>
</html>`;

export async function middleware(request: NextRequest) {
  const maintenance = process.env.MAINTENANCE_MODE !== "false";
  if (maintenance) {
    return new NextResponse(MAINTENANCE_HTML, {
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
    "/((?!_next/static|_next/image|favicon.ico|wp-content|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2|woff|ttf|html)$).*)",
  ],
};
