import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informe para la familia | EDUGUIA",
  description: "Resumen educativo bilingüe para familias — EduKids GT",
  robots: { index: false, follow: false },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {children}
    </div>
  );
}
