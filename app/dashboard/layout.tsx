import { AppShell } from "@/components/app-shell";
import { EDUGUIA_ROUTES } from "@/lib/auth/eduguia-routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell basePath="/dashboard" logoutPath={EDUGUIA_ROUTES.login}>
      {children}
    </AppShell>
  );
}
