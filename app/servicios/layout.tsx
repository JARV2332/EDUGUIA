import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cursos y Talleres | EduKids GT",
  description: "Cursos de robótica, programación y STEAM para niños en Guatemala — EduKids GT",
};

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
