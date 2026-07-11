/**
 * Trades hook — price history, trade feed, and trade placement.
 *
 * Polls every 3s as a fallback until Supabase realtime is wired.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getMarketPriceHistory,
  listMarketTrades,
  placeTrade,
  type ApiResponse,
} from "../lib/api";
import type {
  PricePoint,
  TradeCreatePayload,
  TradeHistoryItem,
  TradeResult,
  TradeSide,
} from "../types/market";

export type TradesLoadStatus = "idle" | "loading" | "success" | "error";

const DEFAULT_POLL_MS = 3000;

export function useTrades(
  marketId: string | undefined,
  options: { pollMs?: number; enabled?: boolean } = {},
) {
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const enabled = options.enabled !== false;

  const [status, setStatus] = useState<TradesLoadStatus>("idle");
  const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected] = useState(false);

  const refresh = useCallback(async () => {
    if (!marketId) {
      setTrades([]);
      setPriceHistory([]);
      setStatus("idle");
      return;
    }

    setStatus((prev) => (prev === "success" ? prev : "loading"));
    setError(null);

    try {
      const [tradeRows, history] = await Promise.all([
        listMarketTrades(marketId),
        getMarketPriceHistory(marketId),
      ]);
      setTrades(tradeRows);
      setPriceHistory(history);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trades.");
      setStatus("error");
    }
  }, [marketId]);

  useEffect(() => {
    if (!enabled || !marketId) return;

    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);

    return () => window.clearInterval(timer);
  }, [enabled, marketId, pollMs, refresh]);

  return { trades, priceHistory, status, error, realtimeConnected, refresh };
}

export type TradeSubmitStatus = "idle" | "submitting" | "success" | "error";

export function usePlaceTrade(onSuccess?: () => void) {
  const [status, setStatus] = useState<TradeSubmitStatus>("idle");
  const [result, setResult] = useState<TradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const submit = useCallback(
    async (marketId: string, side: TradeSide, amount: number) => {
      setStatus("submitting");
      setError(null);
      setResult(null);

      const payload: TradeCreatePayload = { market_id: marketId, side, amount };
      const response: ApiResponse<TradeResult> = await placeTrade(payload);

      if (!response.success || !response.data) {
        setStatus("error");
        setError(response.error ?? "Trade failed.");
        return null;
      }

      setResult(response.data);
      setStatus("success");
      onSuccessRef.current?.();
      return response.data;
    },
    [],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, submit, reset };
}
