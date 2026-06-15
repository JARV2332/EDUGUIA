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
import { Home } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleHint = searchParams.get("role");
  const redirectParam = searchParams.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: err,
      } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (!user) {
        setError("No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      const role = await getUserRole(supabase, user.id);
      const home = getHomePathForRole(role);
      const destination =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : home;
      router.push(destination);
      router.refresh();
    } catch {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Button variant="ghost" asChild className="absolute left-4 top-4 gap-2 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <Home className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </Button>
      <div className="mb-8 flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl">
          <Image src="/logo.jpeg" alt="EDUGUIA" fill className="object-contain" priority />
        </div>
        <span className="text-2xl font-bold text-foreground">EDUGUIA</span>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>
            {roleHint && isUserRole(roleHint)
              ? `Acceso como ${getRoleLabel(roleHint, "es")}`
              : "Ingresa tu correo y contraseña para acceder."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
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
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href={roleHint && isUserRole(roleHint) ? `/register?role=${roleHint}` : "/register"}
              className="font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              Regístrate
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link href="/acceso" className="hover:underline">
              Elegir otro tipo de acceso
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
          <Link href="/" className="absolute left-4 top-4 text-sm text-muted-foreground hover:text-foreground">
            Volver al inicio
          </Link>
          <div className="text-muted-foreground text-sm">Cargando…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
