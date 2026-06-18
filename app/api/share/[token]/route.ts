export const runtime = "nodejs";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ReportSnapshot } from "@/lib/student-store";
import { familyDisplayName } from "@/lib/share-report";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  if (!token || token.length < 16) {
    return Response.json({ error: "Enlace no válido." }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("informes_compartidos")
      .select("student_name, report_snapshot, expires_at, created_at, activo")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) {
      return Response.json({ error: "Informe no encontrado." }, { status: 404 });
    }

    if (!data.activo) {
      return Response.json({ error: "Este enlace ya no está activo." }, { status: 410 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return Response.json({ error: "Este enlace ha expirado." }, { status: 410 });
    }

    const snapshot = data.report_snapshot as ReportSnapshot;

    return Response.json({
      studentName: familyDisplayName(data.student_name),
      reportSnapshot: snapshot,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    });
  } catch (err) {
    console.error("[share GET]", err);
    return Response.json({ error: "No se pudo cargar el informe." }, { status: 500 });
  }
}
