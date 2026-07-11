/**
 * API client — typed HTTP helpers for the FastAPI backend.
 *
 * Attaches ``Authorization: Bearer`` from the stored demo JWT when present.
 */

import {
  authHeaders,
  clearAuthSession,
  getStoredAccessToken,
  persistAuthSession,
  type AuthTokenResponse,
  type DemoLoginPayload,
} from "./auth";
import type {
  MarketDetail,
  MarketSummary,
  Position,
  PricePoint,
  TradeCreatePayload,
  TradeHistoryItem,
  TradeResult,
  Wallet,
} from "../types/market";

const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
export const API_BASE_URL: string =
  viteEnv?.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      detail?: unknown;
      error?: unknown;
    };
    if (typeof body.error === "string") return body.error;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((item) =>
          typeof item === "object" && item && "msg" in item
            ? String((item as { msg: unknown }).msg)
            : JSON.stringify(item),
        )
        .join("; ");
    }
  } catch {
    // fall through
  }
  return `Request failed with status ${response.status}`;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean } = { auth: true },
): Promise<ApiResponse<T>> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false) {
    const bearer = authHeaders(getStoredAccessToken());
    Object.entries(bearer).forEach(([key, value]) => headers.set(key, value));
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    if (response.status === 401 && options.auth !== false) {
      clearAuthSession();
    }

    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: await parseError(response),
      };
    }

    if (response.status === 204) {
      return { success: true, data: null, error: null };
    }

    const data = (await response.json()) as T;
    return { success: true, data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed.";
    return { success: false, data: null, error: message };
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const result = await apiRequest<T>(path, { method: "GET" });
  if (!result.success || result.data === null) {
    throw new Error(result.error ?? `GET ${path} failed`);
  }
  return result.data;
}

// ---- Auth (demo + Google GIS id_token) ----

export async function demoLogin(
  payload: DemoLoginPayload,
): Promise<ApiResponse<AuthTokenResponse>> {
  const result = await apiRequest<AuthTokenResponse>(
    "/auth/demo",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { auth: false },
  );

  if (result.success && result.data?.access_token) {
    persistAuthSession(result.data);
  }

  return result;
}

export async function googleLogin(
  idToken: string,
): Promise<ApiResponse<AuthTokenResponse>> {
  const result = await apiRequest<AuthTokenResponse>(
    "/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    },
    { auth: false },
  );

  if (result.success && result.data?.access_token) {
    persistAuthSession(result.data);
  }

  return result;
}

export async function fetchCurrentUser(): Promise<ApiResponse<AuthTokenResponse>> {
  const result = await apiRequest<AuthTokenResponse>("/auth/me", {
    method: "GET",
  });
  if (result.success && result.data?.access_token) {
    persistAuthSession(result.data);
  }
  return result;
}

// ---- Market insight (Gemini-backed, read-only) ----

export type InsightTrend =
  | "bullish_yes"
  | "bearish_yes"
  | "flat"
  | "mixed"
  | "unknown";

export type InsightConfidence = "low" | "medium" | "high";

export type InsightSource = "gemini" | "fallback" | "cached";

export interface MarketInsight {
  summary: string;
  trend: InsightTrend;
  confidence: InsightConfidence;
  key_observation: string;
}

export interface MarketInsightResponse {
  market_id: string;
  generated_at: string;
  source: InsightSource;
  insight: MarketInsight;
}

export function getMarketInsight(
  marketId: string,
): Promise<MarketInsightResponse> {
  return apiGet<MarketInsightResponse>(`/markets/${marketId}/insight`);
}

// ---- Markets, trades, positions, wallet ----

export function listMarkets(): Promise<MarketSummary[]> {
  return apiGet<MarketSummary[]>("/markets");
}

export function getMarket(marketId: string): Promise<MarketDetail> {
  return apiGet<MarketDetail>(`/markets/${marketId}`);
}

export function getMarketPriceHistory(marketId: string): Promise<PricePoint[]> {
  return apiGet<PricePoint[]>(`/markets/${marketId}/price-history`);
}

export function listMarketTrades(
  marketId: string,
  limit = 100,
): Promise<TradeHistoryItem[]> {
  return apiGet<TradeHistoryItem[]>(
    `/markets/${marketId}/trades?limit=${limit}`,
  );
}

export async function placeTrade(
  payload: TradeCreatePayload,
): Promise<ApiResponse<TradeResult>> {
  return apiRequest<TradeResult>("/trades", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyWallet(): Promise<ApiResponse<Wallet>> {
  return apiRequest<Wallet>("/me/wallet");
}

export async function getMyMarketPosition(
  marketId: string,
): Promise<ApiResponse<Position>> {
  return apiRequest<Position>(`/markets/${marketId}/position`);
}

export function getMyPositions(): Promise<Position[]> {
  return apiGet<Position[]>("/positions");
}
