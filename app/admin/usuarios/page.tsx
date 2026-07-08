"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Curso } from "@/lib/lms/types";
import type { LmsRole } from "@/lib/auth/lms-roles";
import { getLmsRoleLabel } from "@/lib/auth/lms-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CampusUser {
  id: string;
  nombre: string | null;
  username: string | null;
  role: LmsRole;
  created_at: string;
}

type CreateTab = "estudiante" | "lms_docente" | "admin";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<CampusUser[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<CreateTab>("estudiante");

  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cursoId, setCursoId] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/campus-users");
    const data = (await res.json()) as { users?: CampusUser[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "No se pudieron cargar los usuarios");
      setUsers([]);
    } else {
      setUsers(data.users ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadUsers();
    const loadCursos = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("cursos").select("id, titulo, slug, publicado").order("titulo");
      setCursos((data as Curso[]) ?? []);
    };
    void loadCursos();
  }, [loadUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const res = await fetch("/api/admin/campus-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        username,
        password,
        role: tab,
        cursoId: tab === "estudiante" && cursoId ? cursoId : undefined,
      }),
    });

    const data = (await res.json()) as {
      user?: { username: string };
      matriculaError?: string | null;
      error?: string;
    };

    if (!res.ok) {
      setError(data.error ?? "Error al crear la cuenta");
      setSaving(false);
      return;
    }

    setMessage(
      data.matriculaError
        ? `Cuenta "${data.user?.username}" creada, pero falló la matrícula: ${data.matriculaError}`
        : `Cuenta creada. El usuario puede entrar con: ${data.user?.username}`
    );
    setNombre("");
    setUsername("");
    setPassword("");
    setCursoId("");
    setSaving(false);
    await loadUsers();
  };

  const filtered = users.filter((u) => u.role === tab);

  const submitLabel =
    tab === "estudiante" ? "Crear estudiante" : tab === "lms_docente" ? "Crear docente" : "Crear administrador";

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Usuarios del campus</h1>
        <p className="mt-2 text-muted-foreground">
          Crea estudiantes, docentes y administradores con usuario y contraseña. No se envía correo de verificación.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nueva cuenta</CardTitle>
            <CardDescription>
              Entrega al usuario su nombre de usuario y contraseña para entrar en /campus/login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as CreateTab)}>
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="estudiante">Estudiante</TabsTrigger>
                <TabsTrigger value="lms_docente">Docente</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="estudiante">
                <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuario de acceso</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej. maria.garcia"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña inicial</Label>
                    <Input
                      id="password"
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Matricular en curso (opcional)</Label>
                    <Select value={cursoId || "none"} onValueChange={(v) => setCursoId(v === "none" ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin matrícula aún" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin matrícula aún</SelectItem>
                        {cursos.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Creando…" : submitLabel}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="lms_docente">
                <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre-doc">Nombre completo</Label>
                    <Input id="nombre-doc" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username-doc">Usuario de acceso</Label>
                    <Input
                      id="username-doc"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej. prof.rodriguez"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-doc">Contraseña inicial</Label>
                    <Input
                      id="password-doc"
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Creando…" : submitLabel}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="admin">
                <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Los administradores pueden editar el sitio web, cursos, usuarios y matrículas.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="nombre-admin">Nombre completo</Label>
                    <Input id="nombre-admin" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username-admin">Usuario de acceso</Label>
                    <Input
                      id="username-admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ej. admin.soporte"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin">Contraseña inicial</Label>
                    <Input
                      id="password-admin"
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Creando…" : submitLabel}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuentas existentes</CardTitle>
            <CardDescription>{getLmsRoleLabel(tab)} registrados por el administrador</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Cargando…</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground">Aún no hay cuentas de este tipo.</p>
            ) : (
              <ul className="space-y-3">
                {filtered.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{u.nombre || "Sin nombre"}</p>
                      <p className="text-sm text-muted-foreground">@{u.username || "—"}</p>
                    </div>
                    <Badge variant="secondary">{getLmsRoleLabel(u.role)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
