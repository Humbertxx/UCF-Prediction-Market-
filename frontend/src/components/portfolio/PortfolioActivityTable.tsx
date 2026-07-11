/**
 * Portfolio activity table — user's trades across markets (Kalshi-style).
 */

import { Link } from "react-router-dom";

import { formatPriceFromBps } from "../../lib/marketFormat";
import type { UserTradeHistoryItem } from "../../types/market";

interface PortfolioActivityTableProps {
  trades: UserTradeHistoryItem[];
  emptyMessage: string;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PortfolioActivityTable({
  trades,
  emptyMessage,
}: PortfolioActivityTableProps) {
  if (trades.length === 0) {
    return (
      <p className="rounded-card border border-line bg-card px-6 py-10 text-center text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-card">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-line bg-surface text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Market</th>
            <th className="px-4 py-3 font-medium">Side</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Shares</th>
            <th className="px-4 py-3 font-medium">Cost</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-surface/60">
              <td className="px-4 py-4 font-data text-xs tabular-nums text-muted">
                {formatWhen(trade.created_at)}
              </td>
              <td className="px-4 py-4">
                <Link
                  to={`/markets/${trade.market_id}`}
                  className="font-display font-medium text-ink hover:underline"
                >
                  {trade.market_title}
                </Link>
              </td>
              <td
                className={[
                  "px-4 py-4 font-data uppercase tabular-nums",
                  trade.side === "yes" ? "text-yes" : "text-no",
                ].join(" ")}
              >
                {trade.side}
              </td>
              <td className="hidden px-4 py-4 font-data tabular-nums text-ink sm:table-cell">
                {trade.shares.toLocaleString()}
              </td>
              <td className="px-4 py-4 font-data tabular-nums text-ink">
                {trade.cost_credits.toLocaleString()} cr
              </td>
              <td className="px-4 py-4 text-right font-data tabular-nums text-ink">
                {formatPriceFromBps(trade.yes_price_bps)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
