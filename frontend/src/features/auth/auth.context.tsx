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
  identities?: {
    id: string;
    provider: string;
    created_at: string;
    last_sign_in_at: string;
    updated_at?: string;
  }[];
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
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  unlinkProvider: (provider: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = useMemo(
    () =>
      (supabaseUser: SupabaseUser | null, profileData: Partial<User> = {}): User | null => {
        if (!supabaseUser) return null;
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          // Use profile data if available, fallback to metadata
          full_name: profileData.full_name || supabaseUser.user_metadata?.full_name || null,
          avatar_url: profileData.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
          role: profileData.role || "user",
          identities: supabaseUser.identities?.map(identity => ({
            id: identity.id,
            provider: identity.provider,
            created_at: identity.created_at || "",
            last_sign_in_at: identity.last_sign_in_at || "",
            updated_at: identity.updated_at
          }))
        };
      },
    [],
  );

  // Fetch user profile from backend
  const fetchProfile = async (): Promise<Partial<User>> => {
    try {
      const response = await api.get('/auth/me');
      // Backend now returns { user, profileId, role } inside data.
      // But we constructed the user object in backend middleware with DB profile data.
      // So response.data.data.user has the correct full_name/avatar_url from DB.
      
      const userData = response.data?.data?.user;
      const role = response.data?.data?.role || 'user';
      
      const profileData = {
          role,
          full_name: userData?.full_name,
          avatar_url: userData?.avatar_url
      };
      
      // Cache the fresh profile
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      
      return profileData;
    } catch (err) {
      console.warn('[Auth] fetchProfile failed, check console for details');
      // Return cached profile if available
      try {
        const cached = localStorage.getItem('user_profile');
        if (cached) return JSON.parse(cached);
      } catch (e) { /* ignore parse error */ }
      
      return { role: 'user' };
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
          // 2. Try to get cached profile first (instant)
          let cachedProfile: Partial<User> = {};
          try {
             const cached = localStorage.getItem('user_profile');
             if (cached) cachedProfile = JSON.parse(cached);
          } catch(e) {}
          
          if (cachedProfile.role) { // Basic check if cache is valid-ish
            console.log('[Auth] Using cached profile:', cachedProfile);
            setUser(mapUser(data.session.user, cachedProfile));
            setLoading(false); // Render immediately
            
            // 3. Background fetch (Fire and forget, but update state if changed)
            fetchProfile().then(freshProfile => {
              if (!mounted) return;
              // Deep compare or just simple check to avoid unnecessary rerenders? 
              // For now just set it, React balances updates usually.
              // To be safer let's just update.
              setUser(mapUser(data.session.user, freshProfile));
            }).catch(console.error);

            // We are done with init, background/hooks will handle the rest
            return; 
          }
          
          // 4. No cache? We must wait for fetch
          console.log('[Auth] No cache, waiting for fetch...');
          const freshProfile = await fetchProfile();
          if (mounted) {
             setUser(mapUser(data.session.user, freshProfile));
          }
        } else if (mounted) {
          setUser(null);
          localStorage.removeItem('user_profile');
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
             let cachedProfile: Partial<User> = {};
             try {
                const cached = localStorage.getItem('user_profile');
                if (cached) cachedProfile = JSON.parse(cached);
             } catch(e) {}

             if (cachedProfile.role) setUser(mapUser(session.user, cachedProfile));
             
             fetchProfile().then(profile => {
               if (mounted) setUser(mapUser(session.user, profile));
               if (mounted) setLoading(false);
             });
           } else {
             // Token refresh etc.
             const profile = await fetchProfile();
             if (mounted) setUser(mapUser(session.user, profile));
             if (mounted) setLoading(false);
           }
        } else {
          setUser(null);
          localStorage.removeItem('user_profile');
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
    localStorage.removeItem('user_profile');
  };

  const updateProfile = async (data: Partial<User>) => {
      // 1. Call Backend
      await api.put('/auth/me', data);
      
      // 2. Update Local State
      if (user) {
          const updatedUser = { ...user, ...data };
          setUser(updatedUser);
          
          // Update cache
          const cached = localStorage.getItem('user_profile');
          if (cached) {
              const profile = JSON.parse(cached);
              localStorage.setItem('user_profile', JSON.stringify({ ...profile, ...data }));
          }
      }
      
      // 3. (Optional) Force refresh to ensure everything is in sync
      await fetchProfile();
  };

  const updatePassword = async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
  };

  const unlinkProvider = async (provider: string) => {
      // We use our backend endpoint for safety checks and because deleteUserIdentity returns void on client but we want to know if it worked?
      // Actually client unlinking is fine but we implemented backend logic to prevent lockout more reliably.
      await api.post('/auth/unlink', { provider });
      
      // Refresh session/user to update identities list
      const { data } = await supabase.auth.refreshSession();
      if (data.session?.user) {
         // Force update user state
         const profile = await fetchProfile();
         setUser(mapUser(data.session.user, profile));
      }
  };

  const reauthenticate = async (password: string) => {
      if (!user?.email) throw new Error("No email to reauthenticate with");
      
      const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password
      });

      if (error) throw error;
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
        updateProfile,
        updatePassword,
        unlinkProvider,
        reauthenticate,
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
