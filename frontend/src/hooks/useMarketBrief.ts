/**
 * AI market brief hook (features tab).
 *
 * Loads the batch insight brief on mount, then polls every few seconds so the
 * card sparklines move live during a simulation (like Polymarket/Kalshi). The
 * backend caches each market's insight text for ~5 minutes, so polls stay cheap
 * — only the prices/series refresh — and never re-bill Gemini within the window.
 * Silent polls update data without flipping the page back to skeletons.
 */

import { useCallback, useEffect, useState } from "react";

import { AiMarketBriefResponse, getAiMarketBrief } from "../lib/api";

export type MarketBriefStatus = "idle" | "loading" | "success" | "error";

const POLL_INTERVAL_MS = 5000;

export function useMarketBrief() {
  const [status, setStatus] = useState<MarketBriefStatus>("idle");
  const [data, setData] = useState<AiMarketBriefResponse | null>(null);

  const load = useCallback(async (silent: boolean) => {
    if (!silent) setStatus("loading");
    try {
      setData(await getAiMarketBrief());
      setStatus("success");
    } catch {
      // Keep the last good data on a silent poll failure; only surface errors
      // for the explicit initial load / manual refresh.
      if (!silent) setStatus("error");
    }
  }, []);

  const refresh = useCallback(() => load(false), [load]);

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => void load(true), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  return { status, data, refresh };
}
