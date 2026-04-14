import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

// ── Types ──────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  contact?: string;
  role: "RESIDENT" | "ADMIN" | "GUARD";
  flatNumber?: string;
  wing?: string;
  societyId?: string;
  mustChangePassword?: boolean;
  society?: { id: string; name: string } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** Call after a successful login API response. Stores tokens + user. */
  login: (payload: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  /** Clears tokens, user state, query cache, and redirects to /login. */
  logout: () => void;
  /** Merge partial updates into the current user (e.g. after changing name). */
  updateUser: (partial: Partial<AuthUser>) => void;
}

// ── Context ────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helper ─────────────────────────────────────────────────
function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const queryClient = useQueryClient();

  const login = useCallback(
    (payload: { user: AuthUser; accessToken: string; refreshToken: string }) => {
      queryClient.clear();
      localStorage.setItem("accessToken", payload.accessToken);
      localStorage.setItem("refreshToken", payload.refreshToken);
      localStorage.setItem("user", JSON.stringify(payload.user));
      setUser(payload.user);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore — best-effort server-side revocation
    }
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
