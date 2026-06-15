import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const roles = [
  {
    id: "estudiante",
    title: "Estudiante",
    description: "Accede a tus cursos, clases grabadas, materiales y actividades asignadas.",
    href: "/login?role=estudiante",
    registerHref: "/register?role=estudiante",
    icon: GraduationCap,
    accent: "border-secondary/30 bg-secondary/5",
  },
  {
    id: "docente",
    title: "Docente",
    description: "Gestiona cursos, sube materiales, crea tareas y usa EDUGUIA para inclusión.",
    href: "/login?role=docente",
    registerHref: "/register?role=docente",
    icon: UserCog,
    accent: "border-primary/30 bg-primary/5",
  },
  {
    id: "admin",
    title: "Administrador",
    description: "Crea cursos, asigna docentes y matricula estudiantes en el campus virtual.",
    href: "/login?role=admin",
    registerHref: null,
    icon: Shield,
    accent: "border-amber-500/30 bg-amber-500/5",
  },
] as const;

export default function AccesoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f7fa] to-white">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/logo-edukids.png" alt="EduKids" width={120} height={48} className="h-12 w-auto" />
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">Volver al sitio</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Campus virtual</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Área de aprendizaje EduKids
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Entorno virtual para cursos de robótica y STEAM: clases grabadas, materiales, actividades y seguimiento
            docente con EDUGUIA.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className={`${role.accent} shadow-sm`}>
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm">
                  <role.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href={role.href}>Iniciar sesión</Link>
                </Button>
                {role.registerHref && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={role.registerHref}>Crear cuenta</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Las cuentas de administrador las crea el equipo EduKids en Supabase (rol <code>admin</code>).
        </p>
      </main>
    </div>
  );
}
