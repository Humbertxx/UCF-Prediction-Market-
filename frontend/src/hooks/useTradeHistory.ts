/**
 * User trade history hook — portfolio activity feed.
 */

import { useCallback, useEffect, useState } from "react";

import { getMyTrades } from "../lib/api";
import type { UserTradeHistoryItem } from "../types/market";

export type TradeHistoryLoadStatus = "idle" | "loading" | "success" | "error" | "empty";

export function useMyTradeHistory(enabled: boolean, marketId?: string) {
  const [status, setStatus] = useState<TradeHistoryLoadStatus>("idle");
  const [trades, setTrades] = useState<UserTradeHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setTrades([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const rows = await getMyTrades(100, marketId);
      setTrades(rows);
      setStatus(rows.length === 0 ? "empty" : "success");
    } catch (loadError) {
      setTrades([]);
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load trade history.",
      );
      setStatus("error");
    }
  }, [enabled, marketId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { trades, status, error, refresh };
}
