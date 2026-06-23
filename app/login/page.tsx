import { redirect } from "next/navigation";
import { EDUGUIA_ROUTES } from "@/lib/auth/eduguia-routes";

export default async function LegacyLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.redirect) qs.set("redirect", params.redirect);
  if (params.error) qs.set("error", params.error);
  const query = qs.toString();
  redirect(query ? `${EDUGUIA_ROUTES.login}?${query}` : EDUGUIA_ROUTES.login);
}
