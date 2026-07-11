/**
 * Price chart placeholder — Recharts wiring comes in a later phase.
 *
 * Shows current price and point count from polled price history.
 */

import { formatPriceFromBps } from "../../lib/marketFormat";
import type { PricePoint } from "../../types/market";

interface PriceChartPlaceholderProps {
  priceHistory: PricePoint[];
  currentYesPriceBps: number;
  loading?: boolean;
}

export default function PriceChartPlaceholder({
  priceHistory,
  currentYesPriceBps,
  loading = false,
}: PriceChartPlaceholderProps) {
  const latest = priceHistory[priceHistory.length - 1];

  return (
    <section className="rounded-card border border-line bg-card p-4 md:p-6">
      <h2 className="font-display text-base font-semibold text-ink">
        Price history
      </h2>

      {loading && priceHistory.length === 0 ? (
        <p className="mt-3 text-sm text-muted" role="status">
          Loading chart data…
        </p>
      ) : priceHistory.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No trades yet — the chart will appear after the first trade.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="font-data text-sm tabular-nums text-muted">
            {priceHistory.length} price point
            {priceHistory.length === 1 ? "" : "s"} · latest YES{" "}
            {formatPriceFromBps(latest?.yes_price_bps ?? currentYesPriceBps)}
          </p>

          <div className="flex h-32 items-end gap-0.5 rounded-btn border border-line bg-surface px-2 py-2">
            {priceHistory.slice(-40).map((point) => {
              const height = Math.max(8, (point.yes_price_bps / 10000) * 100);
              return (
                <div
                  key={point.trade_id}
                  className="min-w-[3px] flex-1 rounded-t-sm bg-yes/70"
                  style={{ height: `${height}%` }}
                  title={`YES ${formatPriceFromBps(point.yes_price_bps)}`}
                />
              );
            })}
          </div>

          <p className="text-xs text-muted">
            Full Recharts line chart will replace this sparkline in the next
            phase.
          </p>
        </div>
      )}
    </section>
  );
}
