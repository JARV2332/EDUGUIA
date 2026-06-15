"use client";

import { AppShell } from "@/components/app-shell";
import { BookOpen, Inbox, LayoutDashboard, UserPlus, Users } from "lucide-react";

const adminNav = [
  { name: "Panel", href: "/admin", icon: LayoutDashboard },
  { name: "Usuarios", href: "/admin/usuarios", icon: UserPlus },
  { name: "Cursos", href: "/admin/cursos", icon: BookOpen },
  { name: "Matrículas", href: "/admin/matriculas", icon: Users },
  { name: "Contacto", href: "/admin/contactos", icon: Inbox },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      basePath="/admin"
      navigation={adminNav}
      brandTitle="EduKids Admin"
      brandSubtitle="Campus virtual"
      brandLogo="/assets/logo-edukids.png"
      logoutPath="/campus/login"
    >
      {children}
    </AppShell>
  );
}
