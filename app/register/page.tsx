"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getHomePathForRole, getUserRole } from "@/lib/auth/get-user-role";
import { getRoleLabel, isUserRole, type UserRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = isUserRole(searchParams.get("role")) ? searchParams.get("role")! : "estudiante";
  const [role, setRole] = useState<UserRole>(initialRole as UserRole);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre: nombre || undefined, role } },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
      router.refresh();
      if (data.user) {
        const userRole = await getUserRole(supabase, data.user.id);
        setTimeout(() => router.push(getHomePathForRole(userRole)), 1500);
      }
    } catch {
      setError("Error al registrarse");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Cuenta creada. Redirigiendo…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl">
          <Image src="/assets/logo-edukids.png" alt="EduKids" fill className="object-contain" priority />
        </div>
        <span className="text-2xl font-bold text-foreground">EduKids LMS</span>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate como {getRoleLabel(role, "es").toLowerCase()} en el entorno virtual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => isUserRole(v) && setRole(v)} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="estudiante">Estudiante</TabsTrigger>
              <TabsTrigger value="docente">Docente</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                disabled={loading}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Creando cuenta…" : "Registrarme"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/login?role=${role}`}
              className="font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              Inicia sesión
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            ¿Eres administrador?{" "}
            <Link href="/login?role=admin" className="underline hover:no-underline">
              Acceso administrador
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm">Cargando…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
