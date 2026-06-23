import { redirect } from "next/navigation";
import { EDUGUIA_ROUTES } from "@/lib/auth/eduguia-routes";

export default function LegacyRegisterRedirect() {
  redirect(EDUGUIA_ROUTES.register);
}
