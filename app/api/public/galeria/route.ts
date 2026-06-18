export const runtime = "nodejs";

import { getPublicGaleria } from "@/lib/landing/get-galeria";

export async function GET() {
  const items = await getPublicGaleria();
  return Response.json({ items });
}
