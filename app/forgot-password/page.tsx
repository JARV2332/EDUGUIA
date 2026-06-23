import { redirect } from "next/navigation";
import { EDUGUIA_ROUTES } from "@/lib/auth/eduguia-routes";

export default function LegacyForgotPasswordRedirect() {
  redirect(EDUGUIA_ROUTES.forgotPassword);
}
