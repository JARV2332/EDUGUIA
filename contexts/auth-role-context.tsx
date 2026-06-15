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
import { getEduguiaUserRole } from "@/lib/auth/get-user-role";
import type { EduguiaRole } from "@/lib/auth/roles";

interface AuthRoleContextType {
  role: EduguiaRole | null;
  loading: boolean;
  refreshRole: () => Promise<void>;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export function AuthRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<EduguiaRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        return;
      }
      const userRole = await getEduguiaUserRole(supabase, user.id);
      setRole(userRole);
    } catch {
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshRole();
  }, [refreshRole]);

  return (
    <AuthRoleContext.Provider value={{ role, loading, refreshRole }}>
      {children}
    </AuthRoleContext.Provider>
  );
}

export function useAuthRole() {
  const ctx = useContext(AuthRoleContext);
  if (!ctx) {
    throw new Error("useAuthRole must be used within AuthRoleProvider");
  }
  return ctx;
}
