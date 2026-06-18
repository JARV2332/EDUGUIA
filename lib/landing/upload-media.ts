import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { publicStorageUrl } from "@/lib/landing/get-galeria";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadLandingImage(file: File): Promise<{ url: string; path: string }> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Solo se permiten imágenes JPG, PNG, WebP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from("landing-media").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  return { path, url: publicStorageUrl(path) };
}
