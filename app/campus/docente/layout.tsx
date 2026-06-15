"use client";

import { AppShell } from "@/components/app-shell";
import { BookOpen } from "lucide-react";

const docenteNav = [{ name: "Mis cursos", href: "/campus/docente", icon: BookOpen }];

export default function CampusDocenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      basePath="/campus/docente"
      navigation={docenteNav}
      brandTitle="EduKids"
      brandSubtitle="Campus — Docente"
      brandLogo="/assets/logo-edukids.png"
      logoutPath="/campus/login"
    >
      {children}
    </AppShell>
  );
}
