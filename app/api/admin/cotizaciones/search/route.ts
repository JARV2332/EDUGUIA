export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { searchElectronicadiy } from "@/lib/cotizaciones/electronicadiy";

export async function GET(request: Request) {
  try {
    const auth = await requireLmsAdmin(request);
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return Response.json({ error: "Escribe al menos 2 caracteres" }, { status: 400 });
    }

    const result = await searchElectronicadiy(q, 10);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo buscar en Electrónica DIY";
    return Response.json({ error: message }, { status: 502 });
  }
}
