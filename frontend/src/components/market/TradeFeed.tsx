/**
 * Trade feed — recent trades for one market.
 */

import { useEffect, useRef } from "react";

import { formatPriceFromBps } from "../../lib/marketFormat";
import { formatTradeSideAction } from "../../lib/terminology";
import type { TradeHistoryItem } from "../../types/market";

interface TradeFeedProps {
  trades: TradeHistoryItem[];
  loading?: boolean;
  error?: string | null;
  realtimeConnected?: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function TradeFeed({
  trades,
  loading = false,
  error = null,
  realtimeConnected = false,
}: TradeFeedProps) {
  const prevIdsRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    prevIdsRef.current = new Set(trades.map((trade) => trade.id));
  }, [trades]);

  return (
    <section className="rounded-card border border-line bg-card p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-semibold text-ink">
          Recent trades
        </h2>
        {!realtimeConnected && (
          <span className="text-xs text-muted">Polling every 3s</span>
        )}
      </div>

      {loading && trades.length === 0 && (
        <p className="mt-3 text-sm text-muted" role="status">
          Loading trades…
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-muted">
          Couldn&apos;t load trades. They&apos;ll retry on the next poll.
        </p>
      )}

      {!loading && !error && trades.length === 0 && (
        <p className="mt-3 text-sm text-muted">
          No trades yet. Be the first to move the price.
        </p>
      )}

      {trades.length > 0 && (
        <ul className="mt-3 divide-y divide-line">
          {trades.map((trade) => {
            const isNew =
              prevIdsRef.current !== null &&
              !prevIdsRef.current.has(trade.id);

            return (
              <li
                key={trade.id}
                className={[
                  "flex items-center justify-between gap-3 py-2 text-sm",
                  isNew ? "trade-row-enter trade-row-fade-in" : "",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <p className="font-data tabular-nums text-ink">
                    <span className={trade.side === "yes" ? "text-yes" : "text-no"}>
                      {trade.is_bot
                        ? trade.bot_label ?? "Bot"
                        : "Trader"}
                    </span>{" "}
                    {formatTradeSideAction(trade.side, trade.shares)} @{" "}
                    {formatPriceFromBps(trade.yes_price_bps)}
                  </p>
                  <p className="text-xs text-muted">
                    {trade.cost_credits} credits · {formatTime(trade.created_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
