"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getCampusHomeForRole, getLmsUserRole } from "@/lib/auth/get-lms-user-role";
import { getLmsRoleLabel, isLmsRole } from "@/lib/auth/lms-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function CampusLoginForm() {
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
      const { data: { user }, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err || !user) {
        setError(err?.message ?? "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      const role = await getLmsUserRole(supabase, user.id);
      if (!role) {
        setError("Esta cuenta no pertenece al campus EduKids. Usa el login de EDUGUIA si eres docente de inclusión.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      if (roleHint) {
        const expected = roleHint === "docente" ? "lms_docente" : roleHint;
        if (isLmsRole(expected) && expected !== role) {
          setError(`Esta cuenta es de ${getLmsRoleLabel(role)}. Elige el acceso correcto.`);
          setLoading(false);
          return;
        }
      }
      const home = getCampusHomeForRole(role);
      router.push(redirectParam?.startsWith("/") ? redirectParam : home);
      router.refresh();
    } catch {
      setError("Error al iniciar sesión");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f4f7fa] to-white p-4">
      <Button variant="ghost" asChild className="absolute left-4 top-4">
        <Link href="/acceso">← Volver</Link>
      </Button>
      <div className="mb-8 flex items-center gap-3">
        <Image src="/assets/logo-edukids.png" alt="EduKids" width={140} height={56} className="h-14 w-auto" priority />
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Campus EduKids</CardTitle>
          <CardDescription>
            {roleHint && isLmsRole(roleHint)
              ? `Acceso como ${getLmsRoleLabel(roleHint)}`
              : "Inicia sesión en el área de aprendizaje virtual."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando…" : "Entrar al campus"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href={`/campus/register${roleHint ? `?role=${roleHint}` : ""}`} className="text-primary underline">
              Regístrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CampusLoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando…</div>}>
      <CampusLoginForm />
    </Suspense>
  );
}
