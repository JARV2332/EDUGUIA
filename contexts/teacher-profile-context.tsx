"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { TeacherProfile } from "@/lib/teacher-profile";

interface TeacherProfileContextType {
  profile: TeacherProfile | null;
  loading: boolean;
  saving: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: { nombre?: string; escuela?: string; avatar_url?: string | null }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

const TeacherProfileContext = createContext<TeacherProfileContextType | undefined>(undefined);

export function TeacherProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("docentes")
        .select("id, nombre, escuela, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error cargando perfil docente:", error);
        setProfile(null);
        return;
      }

      if (!data?.id) {
        setProfile(null);
        return;
      }

      setProfile({
        id: data.id,
        nombre: data.nombre ?? "",
        escuela: data.escuela ?? "",
        avatar_url: data.avatar_url ?? null,
        email: user.email ?? undefined,
      });
    } catch (e) {
      console.error("Error cargando perfil docente:", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const updateProfile = useCallback(
    async (patch: { nombre?: string; escuela?: string; avatar_url?: string | null }) => {
      if (!profile?.id) return;
      setSaving(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("docentes")
          .update(patch)
          .eq("id", profile.id)
          .select("id, nombre, escuela, avatar_url")
          .single();

        if (error) throw error;

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                nombre: data.nombre ?? prev.nombre,
                escuela: data.escuela ?? prev.escuela,
                avatar_url: data.avatar_url ?? null,
              }
            : prev
        );
      } finally {
        setSaving(false);
      }
    },
    [profile?.id]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("teacher-avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("teacher-avatars").getPublicUrl(path);

      await updateProfile({ avatar_url: publicUrl });
    },
    [updateProfile]
  );

  return (
    <TeacherProfileContext.Provider
      value={{ profile, loading, saving, refreshProfile, updateProfile, uploadAvatar }}
    >
      {children}
    </TeacherProfileContext.Provider>
  );
}

export function useTeacherProfile() {
  const ctx = useContext(TeacherProfileContext);
  if (!ctx) {
    throw new Error("useTeacherProfile must be used within TeacherProfileProvider");
  }
  return ctx;
}
