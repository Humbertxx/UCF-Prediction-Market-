/**
 * Trades hook — price history, trade feed, and trade placement.
 *
 * Subscribes to Supabase `postgres_changes` INSERTs on `trades` for the market
 * and refetches on each event; keeps a polling fallback in the same hook so the
 * feed still moves if the websocket is unavailable (backed off while realtime is
 * connected, restored to 3s on drop).
 */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getMarketPriceHistory,
  listMarketTrades,
  placeTrade,
  type ApiResponse,
} from "../lib/api";
import { getSupabaseClient } from "../lib/supabase";
import type {
  PricePoint,
  TradeCreatePayload,
  TradeHistoryItem,
  TradeResult,
  TradeSide,
} from "../types/market";

export type TradesLoadStatus = "idle" | "loading" | "success" | "error";

const DEFAULT_POLL_MS = 3000;
// While realtime is connected, poll slowly as a backstop instead of every 3s.
const CONNECTED_POLL_MS = 15000;
// Collapse a burst of bot INSERTs into a single refetch.
const EVENT_DEBOUNCE_MS = 250;

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
  const [realtimeConnected, setRealtimeConnected] = useState(false);

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

  // Keep the latest `refresh` reachable from the subscription effect without
  // re-subscribing every time it changes.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  // Realtime subscription: postgres_changes INSERT on trades for this market.
  useEffect(() => {
    if (!enabled || !marketId) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let debounce: number | undefined;
    const channel = supabase
      .channel(`trades:${marketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trades",
          filter: `market_id=eq.${marketId}`,
        },
        () => {
          window.clearTimeout(debounce);
          debounce = window.setTimeout(
            () => void refreshRef.current(),
            EVENT_DEBOUNCE_MS,
          );
        },
      )
      .subscribe((subStatus) => {
        setRealtimeConnected(subStatus === "SUBSCRIBED");
      });

    return () => {
      window.clearTimeout(debounce);
      setRealtimeConnected(false);
      void supabase.removeChannel(channel);
    };
  }, [enabled, marketId]);

  // Initial load + polling fallback (slower while realtime is connected).
  useEffect(() => {
    if (!enabled || !marketId) return;

    void refresh();
    const interval = realtimeConnected
      ? CONNECTED_POLL_MS
      : Math.min(pollMs, DEFAULT_POLL_MS);
    const timer = window.setInterval(() => {
      void refresh();
    }, interval);

    return () => window.clearInterval(timer);
  }, [enabled, marketId, pollMs, refresh, realtimeConnected]);

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
