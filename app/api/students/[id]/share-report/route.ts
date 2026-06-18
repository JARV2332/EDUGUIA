export const runtime = "nodejs";

import { createClient } from "@/lib/supabase/route-handler";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ReportSnapshot } from "@/lib/student-store";
import { parseAssessmentPayloadFromDb } from "@/lib/student-store";
import { buildShareUrl } from "@/lib/share-report";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: estudianteId } = await context.params;
  const supabase = await createClient();

  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: docente } = await supabase
    .from("docentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!docente?.id) {
    return Response.json({ error: "Teacher profile not found" }, { status: 403 });
  }

  const { data: estudiante } = await supabase
    .from("estudiantes")
    .select("nombre, assessment_data, docente_id")
    .eq("id", estudianteId)
    .single();

  if (!estudiante || estudiante.docente_id !== docente.id) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const parsed = parseAssessmentPayloadFromDb(estudiante.assessment_data);
  const snapshot = parsed.reportSnapshot;

  if (!snapshot?.report?.length) {
    return Response.json(
      { error: "Primero genera el informe final para compartir con la familia." },
      { status: 400 }
    );
  }

  let body: { daysValid?: number } = {};
  try {
    body = (await req.json()) as { daysValid?: number };
  } catch {
    /* empty body ok */
  }

  const days = Math.min(Math.max(body.daysValid ?? 30, 7), 90);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from("informes_compartidos")
    .update({ activo: false })
    .eq("estudiante_id", estudianteId)
    .eq("docente_id", docente.id)
    .eq("activo", true);

  const { data: created, error } = await supabase
    .from("informes_compartidos")
    .insert({
      estudiante_id: estudianteId,
      docente_id: docente.id,
      student_name: estudiante.nombre,
      report_snapshot: snapshot as ReportSnapshot,
      expires_at: expiresAt,
      activo: true,
    })
    .select("token, expires_at, created_at")
    .single();

  if (error || !created) {
    console.error("[share-report]", error);
    return Response.json({ error: error?.message ?? "Could not create share link" }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  return Response.json({
    token: created.token,
    url: buildShareUrl(created.token, origin),
    expiresAt: created.expires_at,
    createdAt: created.created_at,
  });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: estudianteId } = await context.params;
  const supabase = await createClient();

  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: docente } = await supabase
    .from("docentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!docente?.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase
    .from("informes_compartidos")
    .update({ activo: false })
    .eq("estudiante_id", estudianteId)
    .eq("docente_id", docente.id);

  return Response.json({ ok: true });
}
