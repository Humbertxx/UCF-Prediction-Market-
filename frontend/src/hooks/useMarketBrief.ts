/**
 * AI market brief hook (features tab).
 *
 * Fetches the batch insight brief once on mount — the backend caches each
 * market's insight for ~5 minutes, so repeat visits are instant and cheap.
 */

import { useCallback, useEffect, useState } from "react";

import { AiMarketBriefResponse, getAiMarketBrief } from "../lib/api";

export type MarketBriefStatus = "idle" | "loading" | "success" | "error";

export function useMarketBrief() {
  const [status, setStatus] = useState<MarketBriefStatus>("idle");
  const [data, setData] = useState<AiMarketBriefResponse | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      setData(await getAiMarketBrief());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, data, refresh };
}
