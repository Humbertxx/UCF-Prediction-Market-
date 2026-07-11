/**
 * Market insight hook.
 *
 * Purpose:
 * - Fetch the Gemini-backed insight for one market, on demand only.
 *
 * Intended behavior:
 * - Explicit trigger (user clicks "Get insight"); never runs on poll ticks.
 * - Expose idle/loading/success/error states for the insight panel.
 */

import { useCallback, useState } from "react";

import { getMarketInsight, MarketInsightResponse } from "../lib/api";

export type InsightStatus = "idle" | "loading" | "success" | "error";

export function useInsight(marketId: string | undefined) {
  const [status, setStatus] = useState<InsightStatus>("idle");
  const [data, setData] = useState<MarketInsightResponse | null>(null);

  const fetchInsight = useCallback(async () => {
    if (!marketId) return;
    setStatus("loading");
    try {
      setData(await getMarketInsight(marketId));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [marketId]);

  return { status, data, fetchInsight };
}
