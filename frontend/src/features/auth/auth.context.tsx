import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signupWithPassword: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = useMemo(
    () =>
      (supabaseUser: SupabaseUser | null): User | null => {
        if (!supabaseUser) return null;
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          full_name: supabaseUser.user_metadata?.full_name || null,
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
        };
      },
    [],
  );

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(mapUser(data.session?.user || null));
      setLoading(false);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(mapUser(session?.user || null));
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [mapUser]);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signupWithPassword = async (
    email: string,
    password: string,
    fullName?: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithPassword,
        signupWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
