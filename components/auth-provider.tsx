"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/lib/supabase/user";
import { toAppUser } from "@/lib/supabase/user";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AuthContextValue = {
  user: AppUser | null;
  isConfigured: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AppUser | null;
}) {
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const router = useRouter();
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAppUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setUser(null);
    router.push("/");
    router.refresh();
  }, [configured, router]);

  const value = useMemo(
    () => ({ user, isConfigured: configured, signOut }),
    [configured, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return value;
}
