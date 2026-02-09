import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../shared/utils/supabase";
import api from "../../shared/utils/api";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Role } from "../../shared/rbac/permissions";

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: Role;
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
      (supabaseUser: SupabaseUser | null, role: Role = "user"): User | null => {
        if (!supabaseUser) return null;
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          full_name: supabaseUser.user_metadata?.full_name || null,
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          role,
        };
      },
    [],
  );

  // Fetch user profile with role from backend
  const fetchProfile = async (): Promise<Role> => {
    try {
      const response = await api.get('/auth/me');
      const data = response.data?.data;
      const role = (data?.role as Role) || 'user';
      
      // Cache the fresh role
      localStorage.setItem('user_role', role);
      
      return role;
    } catch (err) {
      console.warn('[Auth] fetchProfile failed, check console for details');
      // Return cached role if available, otherwise default to user
      // This prevents downgrading to 'user' if the network times out or backend is down
      const cached = localStorage.getItem('user_role') as Role;
      return cached || 'user';
    }
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    const init = async () => {
      console.log('[Auth] Init starting...');
      try {
        // 1. Check local session (fast)
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user && mounted) {
          // 2. Try to get cached role first (instant)
          const cachedRole = localStorage.getItem('user_role') as Role;
          
          if (cachedRole) {
            console.log('[Auth] Using cached role:', cachedRole);
            setUser(mapUser(data.session.user, cachedRole));
            setLoading(false); // Render immediately
            
            // 3. Background fetch (Fire and forget, but update state if changed)
            fetchProfile().then(freshRole => {
              if (!mounted) return;
              if (freshRole !== cachedRole) {
                 console.log('[Auth] Updating to fresh role:', freshRole);
                 setUser(mapUser(data.session.user, freshRole));
              }
            }).catch(console.error);

            // We are done with init, background/hooks will handle the rest
            return; 
          }
          
          // 4. No cache? We must wait for fetch
          console.log('[Auth] No cache, waiting for fetch...');
          const freshRole = await fetchProfile();
          if (mounted) {
             setUser(mapUser(data.session.user, freshRole));
          }
        } else if (mounted) {
          setUser(null);
          localStorage.removeItem('user_role');
        }
      } catch (err) {
        console.error('[Auth] Init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth State Change:', event);
        if (!mounted) return;

        if (session?.user) {
           if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
             // For sign in, allow blocking fetch or cache
             const cached = localStorage.getItem('user_role') as Role;
             if (cached) setUser(mapUser(session.user, cached));
             
             fetchProfile().then(role => {
               if (mounted) setUser(mapUser(session.user, role));
               if (mounted) setLoading(false);
             });
           } else {
             // Token refresh etc.
             const role = await fetchProfile();
             if (mounted) setUser(mapUser(session.user, role));
             if (mounted) setLoading(false);
           }
        } else {
          setUser(null);
          localStorage.removeItem('user_role');
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
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
