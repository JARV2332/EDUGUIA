import { redirect } from "next/navigation";
import { EDUGUIA_ROUTES } from "@/lib/auth/eduguia-routes";

export default function LegacyResetPasswordRedirect() {
  redirect(EDUGUIA_ROUTES.resetPassword);
}
