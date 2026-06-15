"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Save } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useTeacherProfile } from "@/contexts/teacher-profile-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TeacherProfilePage() {
  const { t } = useLanguage();
  const { profile, loading, saving, updateProfile, uploadAvatar } = useTeacherProfile();
  const [nombre, setNombre] = useState("");
  const [escuela, setEscuela] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre ?? "");
      setEscuela(profile.escuela ?? "");
    }
  }, [profile]);

  const initials =
    (profile?.nombre || profile?.email || "D")
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DG";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await updateProfile({
        nombre: nombre.trim(),
        escuela: escuela.trim(),
      });
      setMessage(t("profile.saved"));
    } catch {
      setError(t("profile.saveError"));
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("profile.photoTypeError"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t("profile.photoSizeError"));
      return;
    }

    setUploadingPhoto(true);
    setError(null);
    setMessage(null);
    try {
      await uploadAvatar(file);
      setMessage(t("profile.photoSaved"));
    } catch {
      setError(t("profile.photoUploadError"));
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
        {t("profile.loading")}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("profile.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("profile.subtitle")}</p>
      </header>

      <div className="mx-auto max-w-2xl space-y-6">
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.photoTitle")}</CardTitle>
            <CardDescription>{t("profile.photoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.nombre || "Docente"} />
              ) : null}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-3 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                id="avatar-upload"
                onChange={(e) => void handlePhotoChange(e)}
                disabled={uploadingPhoto}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {uploadingPhoto ? t("profile.uploadingPhoto") : t("profile.changePhoto")}
              </Button>
              <p className="text-xs text-muted-foreground">{t("profile.photoHint")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.infoTitle")}</CardTitle>
            <CardDescription>{t("profile.infoDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-email">{t("profile.email")}</Label>
                <Input id="profile-email" value={profile?.email ?? ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-nombre">{t("profile.name")}</Label>
                <Input
                  id="profile-nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={t("profile.namePlaceholder")}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-escuela">{t("profile.school")}</Label>
                <Input
                  id="profile-escuela"
                  value={escuela}
                  onChange={(e) => setEscuela(e.target.value)}
                  placeholder={t("profile.schoolPlaceholder")}
                  disabled={saving}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {saving ? t("profile.saving") : t("profile.save")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-muted-foreground">
            <div className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-md">
              <Image src="/logo.jpeg" alt="EDUGUIA" fill className="object-contain" sizes="32px" />
            </div>
            <p>{t("profile.pdfNote")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
