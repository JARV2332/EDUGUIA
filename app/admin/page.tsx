"use client";

import Link from "next/link";
import { BookOpen, Plus, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminHomePage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Panel administrador</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona el campus virtual EduKids: cursos, docentes e inscripciones.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <BookOpen className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Cursos</CardTitle>
            <CardDescription>Crea y publica cursos de robótica y STEAM.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link href="/admin/cursos">
                <Plus className="mr-2 h-4 w-4" />
                Gestionar
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="mb-2 h-8 w-8 text-secondary" />
            <CardTitle>Matrículas</CardTitle>
            <CardDescription>Inscribe estudiantes en los cursos activos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/admin/matriculas">Ver matrículas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
