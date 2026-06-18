export const runtime = "nodejs";

import { requireLmsAdmin } from "@/lib/auth/require-lms-admin";
import { uploadLandingImage } from "@/lib/landing/upload-media";

export async function POST(request: Request) {
  const auth = await requireLmsAdmin(request);
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Selecciona un archivo de imagen." }, { status: 400 });
  }

  try {
    const result = await uploadLandingImage(file);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir imagen";
    return Response.json({ error: message }, { status: 400 });
  }
}
