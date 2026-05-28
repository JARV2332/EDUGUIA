export const runtime = "nodejs";

import { createClient } from "@/lib/supabase/route-handler";
import { buildAssessmentPayloadForDb } from "@/lib/student-store";
import type { AssessmentData, ReportSnapshot } from "@/lib/student-store";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = createClient(req);

  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    nombre?: string;
    edad?: string | null;
    assessment_data?: AssessmentData;
    report_snapshot?: ReportSnapshot;
  };

  const { data: docente } = await supabase
    .from("docentes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!docente?.id) {
    return Response.json({ error: "Teacher profile not found" }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("estudiantes")
    .select("docente_id")
    .eq("id", id)
    .single();

  if (!existing || existing.docente_id !== docente.id) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const assessmentData = body.assessment_data;
  const payload = assessmentData
    ? buildAssessmentPayloadForDb(assessmentData, body.report_snapshot)
    : undefined;

  const { error } = await supabase
    .from("estudiantes")
    .update({
      ...(body.nombre !== undefined && { nombre: body.nombre }),
      ...(body.edad !== undefined && { edad: body.edad }),
      ...(payload !== undefined && { assessment_data: payload }),
    })
    .eq("id", id);

  if (error) {
    console.error("PATCH estudiantes:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
