export const runtime = "nodejs";

import { getPublicCursos } from "@/lib/lms/get-public-cursos";

export async function GET() {
  try {
    const cursos = await getPublicCursos();
    return Response.json(
      { cursos },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar cursos";
    return Response.json({ error: message, cursos: [] }, { status: 500 });
  }
}
