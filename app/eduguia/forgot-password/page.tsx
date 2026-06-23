"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { EDUGUIA_ROUTES } from "@/lib/auth/eduguia-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";

export default function EduguiaForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(EDUGUIA_ROUTES.resetPassword)}`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError("No se pudo enviar el correo. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Button variant="ghost" asChild className="absolute left-4 top-4 gap-2 text-muted-foreground hover:text-foreground">
        <Link href={EDUGUIA_ROUTES.login}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al login
        </Link>
      </Button>
      <Button variant="ghost" asChild className="absolute right-4 top-4 gap-2 text-muted-foreground hover:text-foreground">
        <Link href="/">
          <Home className="h-4 w-4" aria-hidden="true" />
          Inicio
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
          <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            Te enviaremos un enlace a tu correo para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="rounded-md bg-primary/10 px-4 py-3 text-sm text-foreground">
                Si existe una cuenta con <strong>{email}</strong>, recibirás un correo con instrucciones.
                Revisa también la carpeta de spam.
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={EDUGUIA_ROUTES.login}>Volver al login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Enviando…" : "Enviar enlace de recuperación"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
