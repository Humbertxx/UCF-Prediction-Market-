/**
 * Wallet hook — virtual credit balance for the trade panel.
 */

import { useCallback, useEffect, useState } from "react";

import { getMyWallet } from "../lib/api";
import type { Wallet } from "../types/market";

export type WalletLoadStatus = "idle" | "loading" | "success" | "error";

export function useWallet(enabled: boolean) {
  const [status, setStatus] = useState<WalletLoadStatus>("idle");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setWallet(null);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setError(null);

    const result = await getMyWallet();
    if (result.success && result.data) {
      setWallet(result.data);
      setStatus("success");
      return;
    }

    setWallet(null);
    setError(result.error ?? "Failed to load wallet.");
    setStatus("error");
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { wallet, status, error, refresh };
}
