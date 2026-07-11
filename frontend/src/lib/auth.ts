/**
 * Auth module (Mode B demo login).
 *
 * StudySpot pattern adapted for Vite web:
 * - Persist app JWT in localStorage (not AsyncStorage / Expo).
 * - Attach ``Authorization: Bearer <token>`` via ``api.ts``.
 * - Login hits ``POST /auth/demo`` (no Google / Supabase password exchange yet).
 */

const TOKEN_KEY = "ucf_pm_access_token";
const USER_KEY = "ucf_pm_auth_user";

export interface AuthTokenResponse {
  access_token: string;
  token_type: "bearer" | string;
  user_id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
}

export interface DemoLoginPayload {
  email: string;
  name?: string;
}

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredAuthUser(): AuthTokenResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokenResponse;
  } catch {
    return null;
  }
}

export function persistAuthSession(session: AuthTokenResponse): void {
  localStorage.setItem(TOKEN_KEY, session.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function authHeaders(
  accessToken: string | null = getStoredAccessToken(),
): HeadersInit {
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}
