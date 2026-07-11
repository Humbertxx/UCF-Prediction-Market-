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
  UserTradeHistoryItem,
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
  options: { auth?: boolean; clearSessionOn401?: boolean } = {
    auth: true,
    clearSessionOn401: true,
  },
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

    if (response.status === 401 && options.auth !== false && options.clearSessionOn401 !== false) {
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
    const hint =
      message.includes("Failed to fetch") || message.includes("NetworkError")
        ? " Is the API running at " + API_BASE_URL + "?"
        : "";
    return { success: false, data: null, error: message + hint };
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

export function getMyTrades(
  limit = 100,
  marketId?: string,
): Promise<UserTradeHistoryItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (marketId) params.set("market_id", marketId);
  return apiGet<UserTradeHistoryItem[]>(`/users/me/trades?${params}`);
}

// ---- Admin ----

export interface ResolveMarketPayload {
  outcome: "yes" | "no";
  evidence?: string;
}

export interface ResolveMarketResult {
  market_id: string;
  outcome: string;
  positions_settled: number;
  total_payout_credits: number;
  resolved_at: string;
}

export async function resolveMarket(
  marketId: string,
  payload: ResolveMarketPayload,
): Promise<ApiResponse<ResolveMarketResult>> {
  return apiRequest<ResolveMarketResult>(
    `/admin/markets/${marketId}/resolve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

// ---- Admin bot simulation ----

export type SimulateMode = "belief" | "scripted";

export interface SimulateStatus {
  market_id: string;
  running: boolean;
  trades_executed: number;
  skipped_ticks: number;
  last_reason: string | null;
}

export interface SimulateBurstResult {
  market_id: string;
  mode: string;
  trades_executed: number;
  yes_price_bps: number;
}

export async function startSimulation(
  marketId: string,
  options: { bot_label?: string; rng_seed?: number } = {},
): Promise<ApiResponse<SimulateStatus>> {
  return apiRequest<SimulateStatus>("/admin/simulate/start", {
    method: "POST",
    body: JSON.stringify({
      market_id: marketId,
      bot_label: options.bot_label ?? "belief",
      rng_seed: options.rng_seed ?? null,
    }),
  });
}

export async function stopSimulation(
  marketId: string,
): Promise<ApiResponse<SimulateStatus>> {
  return apiRequest<SimulateStatus>("/admin/simulate/stop", {
    method: "POST",
    body: JSON.stringify({ market_id: marketId }),
  });
}

export async function getSimulationStatus(
  marketId: string,
): Promise<ApiResponse<SimulateStatus>> {
  return apiRequest<SimulateStatus>(`/admin/simulate/${marketId}/status`);
}

export async function simulateBurst(
  marketId: string,
  options: {
    trade_count?: number;
    mode?: SimulateMode;
    bot_label?: string;
    rng_seed?: number;
  } = {},
): Promise<ApiResponse<SimulateBurstResult>> {
  return apiRequest<SimulateBurstResult>("/admin/simulate/burst", {
    method: "POST",
    body: JSON.stringify({
      market_id: marketId,
      trade_count: options.trade_count ?? 10,
      mode: options.mode ?? "belief",
      bot_label: options.bot_label ?? null,
      rng_seed: options.rng_seed ?? null,
    }),
  });
}
