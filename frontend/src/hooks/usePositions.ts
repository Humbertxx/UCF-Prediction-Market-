/**
 * Positions hook — user holdings for portfolio and market detail screens.
 */

import { useCallback, useEffect, useState } from "react";

import { getMyMarketPosition, getMyPositions } from "../lib/api";
import { splitPortfolioPositions } from "../lib/portfolio";
import type { Position } from "../types/market";

export type PositionLoadStatus = "idle" | "loading" | "success" | "error" | "empty";

export function usePortfolio(enabled: boolean) {
  const [status, setStatus] = useState<PositionLoadStatus>("idle");
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setPositions([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const rows = await getMyPositions();
      setPositions(rows);
      setStatus(rows.length === 0 ? "empty" : "success");
    } catch (loadError) {
      setPositions([]);
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load portfolio.",
      );
      setStatus("error");
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const { open, history } = splitPortfolioPositions(positions);

  return { positions, open, history, status, error, refresh };
}

export function useMarketPosition(
  marketId: string | undefined,
  enabled: boolean,
) {
  const [status, setStatus] = useState<PositionLoadStatus>("idle");
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !marketId) {
      setPosition(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError(null);

    const result = await getMyMarketPosition(marketId);
    if (result.success && result.data) {
      setPosition(result.data);
      setStatus("success");
      return;
    }

    if (result.error?.includes("404") || result.error?.includes("No position")) {
      setPosition(null);
      setStatus("empty");
      return;
    }

    setPosition(null);
    setError(result.error ?? "Failed to load position.");
    setStatus("error");
  }, [enabled, marketId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { position, status, error, refresh };
}
