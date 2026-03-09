import { createContext, useContext, useEffect, useState } from "react";
import api from "../../shared/utils/api";
import type { Role } from "../../shared/rbac/permissions";

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: Role;
  identities?: any[];
  onboarding_completed?: boolean;
  tours_completed?: string[];
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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // Verify token and get user profile
          const response = await api.get("/auth/me");
          if (response.data.success) {
            const {
              user: _authUser,
              role,
              profileId: _profileId,
            } = response.data.data;
            // Response data user already contains profile info merged by backend middleware
            setUser({ ...response.data.data.user, role });
          }
        } catch (error) {
          console.error("Auth init failed:", error);
          // Token invalid?
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for custom logout event
    const handleLogout = () => {
      setUser(null);
      window.location.href = "/login"; // Force redirect? or just state change
    };
    window.addEventListener("auth:logout", handleLogout);

    // Handle OAuth callback (hash parsing)
    if (window.location.hash && window.location.hash.includes("access_token")) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        // Clear hash
        window.history.replaceState(null, "", window.location.pathname);
        // Trigger init
        initAuth();
      }
    }

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const loginWithPassword = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.success) {
      const { session, user: _authUser } = response.data.data;
      localStorage.setItem("access_token", session.access_token);
      localStorage.setItem("refresh_token", session.refresh_token);

      // We need to fetch the full profile with role
      const meResponse = await api.get("/auth/me");
      if (meResponse.data.success) {
        setUser({
          ...meResponse.data.data.user,
          role: meResponse.data.data.role,
        });
      }
    }
  };

  const signupWithPassword = async (
    email: string,
    password: string,
    fullName?: string,
  ) => {
    const response = await api.post("/auth/signup", {
      email,
      password,
      full_name: fullName,
    });
    if (response.data.success) {
      // Typically signup might not return a session if email confirmation is required.
      // But if it does:
      if (response.data.data.session) {
        const { session } = response.data.data;
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("refresh_token", session.refresh_token);
        const meResponse = await api.get("/auth/me");
        if (meResponse.data.success) {
          setUser({
            ...meResponse.data.data.user,
            role: meResponse.data.data.role,
          });
        }
      }
    }
  };

  const loginWithGoogle = async () => {
    const response = await api.post("/auth/oauth", {
      provider: "google",
      redirectTo: `${window.location.origin}/dashboard`,
    });

    if (response.data.success && response.data.data.url) {
      window.location.href = response.data.data.url;
    }
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.put("/auth/me", data);
    if (response.data.success) {
      const updatedProfile = response.data.data;
      // Prefer server response for canonical profile fields.
      setUser((prev) => (prev ? { ...prev, ...updatedProfile } : null));
    }
  };

  const updatePassword = async (_password: string) => {
    // We didn't implement this backend endpoint yet!
    console.warn("Update password not implemented in backend yet");
  };

  const unlinkProvider = async (provider: string) => {
    await api.post("/auth/unlink", { provider });
    // Visual update logic if needed
  };

  const reauthenticate = async (_password: string) => {
    console.warn("Reauthenticate not implemented");
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
