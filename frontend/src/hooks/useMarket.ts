/**
 * Market data hooks — list and single-market detail with refresh.
 */

import { useCallback, useEffect, useState } from "react";

import { getMarket, listMarkets } from "../lib/api";
import type { MarketDetail, MarketSummary } from "../types/market";

export type MarketLoadStatus = "idle" | "loading" | "success" | "error";

export function useMarkets() {
  const [status, setStatus] = useState<MarketLoadStatus>("idle");
  const [markets, setMarkets] = useState<MarketSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setMarkets(await listMarkets());
      setStatus("success");
    } catch (err) {
      setMarkets([]);
      setError(err instanceof Error ? err.message : "Failed to load markets.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { markets, status, error, refresh };
}

export function useMarketDetail(marketId: string | undefined) {
  const [status, setStatus] = useState<MarketLoadStatus>("idle");
  const [market, setMarket] = useState<MarketDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!marketId) {
      setMarket(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      setMarket(await getMarket(marketId));
      setStatus("success");
    } catch (err) {
      setMarket(null);
      setError(err instanceof Error ? err.message : "Failed to load market.");
      setStatus("error");
    }
  }, [marketId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { market, status, error, refresh };
}
