"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getCampusHomeForRole, getLmsUserRole } from "@/lib/auth/get-lms-user-role";
import { getLmsRoleLabel, isLmsRole, type LmsRole } from "@/lib/auth/lms-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function parseCampusRole(param: string | null): LmsRole {
  if (param === "docente") return "lms_docente";
  return isLmsRole(param) ? param : "estudiante";
}

function CampusRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = parseCampusRole(searchParams.get("role"));
  const [role, setRole] = useState<LmsRole>(initialRole);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre || undefined,
            app: "edukids_lms",
            role,
          },
        },
      });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const userRole = await getLmsUserRole(supabase, data.user.id);
        router.push(userRole ? getCampusHomeForRole(userRole) : "/acceso");
        router.refresh();
      }
    } catch {
      setError("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f4f7fa] to-white p-4">
      <Image src="/assets/logo-edukids.png" alt="EduKids" width={140} height={56} className="mb-8 h-14 w-auto" priority />
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registro campus EduKids</CardTitle>
          <CardDescription>Cuenta para el área de aprendizaje virtual (no es EDUGUIA).</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => isLmsRole(v) && setRole(v)} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="estudiante">Estudiante</TabsTrigger>
              <TabsTrigger value="lms_docente">Docente</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando…" : `Registrarme como ${getLmsRoleLabel(role).toLowerCase()}`}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href={`/campus/login?role=${role}`} className="text-primary underline">
              Ya tengo cuenta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CampusRegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando…</div>}>
      <CampusRegisterForm />
    </Suspense>
  );
}
