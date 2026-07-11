/**
 * Auth session context — demo login + Google GIS → app JWT bearer.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { demoLogin, fetchCurrentUser, googleLogin } from "../lib/api";
import { getMyProfileStats } from "../lib/user";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredAuthUser,
  type AuthTokenResponse,
  type DemoLoginPayload,
} from "../lib/auth";
import type { CurrentUserProfile } from "../types/user";

interface AuthContextValue {
  user: AuthTokenResponse | null;
  profile: CurrentUserProfile | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (payload: DemoLoginPayload) => Promise<boolean>;
  loginWithGoogleIdToken: (idToken: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthTokenResponse | null>(null);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const cached = getStoredAuthUser();
    if (cached) setUser(cached);

    const result = await fetchCurrentUser();
    if (result.success && result.data) {
      setUser(result.data);
      setError(null);

      const profileResult = await getMyProfileStats(result.data.access_token);
      setProfile(profileResult.success ? profileResult.data : null);
    } else {
      clearAuthSession();
      setUser(null);
      setProfile(null);
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (payload: DemoLoginPayload) => {
    setError(null);
    setLoading(true);
    const result = await demoLogin(payload);
    if (!result.success || !result.data) {
      setLoading(false);
      setError(result.error ?? "Login failed.");
      setUser(null);
      setProfile(null);
      return false;
    }
    setUser(result.data);
    const profileResult = await getMyProfileStats(result.data.access_token);
    setProfile(profileResult.success ? profileResult.data : null);
    setLoading(false);
    return true;
  }, []);

  const loginWithGoogleIdToken = useCallback(async (idToken: string) => {
    setError(null);
    setLoading(true);
    const result = await googleLogin(idToken);
    if (!result.success || !result.data) {
      setLoading(false);
      setError(result.error ?? "Google sign-in failed.");
      setUser(null);
      setProfile(null);
      return false;
    }
    setUser(result.data);
    const profileResult = await getMyProfileStats(result.data.access_token);
    setProfile(profileResult.success ? profileResult.data : null);
    setLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setProfile(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      accessToken: user?.access_token ?? getStoredAccessToken(),
      loading,
      error,
      isAuthenticated: Boolean(user?.access_token),
      login,
      loginWithGoogleIdToken,
      logout,
      refresh,
    }),
    [user, profile, loading, error, login, loginWithGoogleIdToken, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
