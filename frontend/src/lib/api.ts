/**
 * API client module.
 *
 * Purpose:
 * - Centralize HTTP communication with the backend service.
 * - Define request helpers for markets, trades, positions, leaderboard, admin.
 *
 * Intended behavior:
 * - Provide a typed and reusable API surface for frontend hooks.
 */

// Cast keeps this file independent of vite/client ambient types until the
// Vite project (package.json/tsconfig) is scaffolded.
const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
const API_BASE_URL: string = viteEnv?.VITE_API_BASE_URL ?? "http://localhost:8000";

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
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
