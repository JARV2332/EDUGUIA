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
import { getUserRole } from "@/lib/auth/get-user-role";
import type { UserRole } from "@/lib/auth/roles";

interface AuthRoleContextType {
  role: UserRole | null;
  loading: boolean;
  refreshRole: () => Promise<void>;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export function AuthRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
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
      const userRole = await getUserRole(supabase, user.id);
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
