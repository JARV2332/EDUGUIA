"use client";

import { AppShell } from "@/components/app-shell";
import { BookOpen, LayoutDashboard } from "lucide-react";

const alumnoNav = [
  { name: "Mis cursos", href: "/alumno", icon: LayoutDashboard },
  { name: "Campus", href: "/acceso", icon: BookOpen },
];

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      basePath="/alumno"
      navigation={alumnoNav}
      brandTitle="EduKids"
      brandSubtitle="Área de aprendizaje"
      brandLogo="/assets/logo-edukids.png"
      logoutPath="/campus/login"
    >
      {children}
    </AppShell>
  );
}
