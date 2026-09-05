"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampusSetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [nombre, setNombre] = useState("Administrador EduKids");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/public/bootstrap");
      const data = (await res.json()) as { hasAdmin?: boolean; needsSql?: boolean; error?: string };
      setHasAdmin(Boolean(data.hasAdmin));
      if (data.needsSql) setError(data.error ?? "Hay que ejecutar el SQL en Supabase.");
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/public/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, nombre }),
    });
    const data = (await res.json()) as { error?: string; username?: string; hint?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el admin");
      return;
    }
    setStatus(`Listo. Entra con usuario ${data.username}. ${data.hint ?? ""}`);
    setTimeout(() => router.push("/campus/login?role=admin"), 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#f4f7fa] to-white p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Primer administrador</CardTitle>
          <CardDescription>
            Base nueva. Crea el usuario admin del campus. Luego entra en Cotizaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasAdmin ? (
            <p className="text-sm">
              Ya hay un admin.{" "}
              <Link href="/campus/login?role=admin" className="underline">
                Iniciar sesión
              </Link>
            </p>
          ) : (
            <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Usuario</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Creando…" : "Crear admin"}
              </Button>
            </form>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
          <p className="text-xs text-muted-foreground">
            Si falla por tablas faltantes: Supabase → SQL Editor → pega{" "}
            <code>supabase/NEW_PROJECT.sql</code> y Run. También desactiva Confirm email.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
