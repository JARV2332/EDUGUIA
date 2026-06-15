"use client";

import { AppShell } from "@/components/app-shell";
import { BookOpen, LayoutDashboard, Users } from "lucide-react";

const adminNav = [
  { name: "Panel", href: "/admin", icon: LayoutDashboard },
  { name: "Cursos", href: "/admin/cursos", icon: BookOpen },
  { name: "Matrículas", href: "/admin/matriculas", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      basePath="/admin"
      navigation={adminNav}
      brandTitle="EduKids Admin"
      brandSubtitle="Campus virtual"
      brandLogo="/assets/logo-edukids.png"
    >
      {children}
    </AppShell>
  );
}
