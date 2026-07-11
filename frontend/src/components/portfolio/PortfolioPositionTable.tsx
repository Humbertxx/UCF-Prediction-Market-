/**
 * Portfolio position rows — Kalshi-style market table for open or settled holdings.
 */

import { Link } from "react-router-dom";

import {
  averageCostPerShare,
  formatCredits,
  formatMarketStatus,
  formatPositionSide,
  formatPriceFromBps,
  pnlColorClass,
} from "../../lib/marketFormat";
import { outcomeResolvedLabel } from "../../lib/terminology";
import type { Position } from "../../types/market";

type PortfolioTableVariant = "open" | "history";

interface PortfolioPositionTableProps {
  positions: Position[];
  variant: PortfolioTableVariant;
  emptyMessage: string;
}

function positionPnl(position: Position, variant: PortfolioTableVariant): number {
  if (variant === "history") {
    if (position.realized_pnl !== 0) return position.realized_pnl;
    return position.unrealized_pnl;
  }
  return position.unrealized_pnl;
}

function OutcomeBadge({ position }: { position: Position }) {
  if (position.market_status !== "resolved" || !position.resolution_outcome) {
    return null;
  }

  const isYes = position.resolution_outcome === "yes";
  return (
    <span
      className={[
        "ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        isYes ? "bg-yes/10 text-yes" : "bg-no/10 text-no",
      ].join(" ")}
    >
      Resolved {outcomeResolvedLabel(isYes)}
    </span>
  );
}

export default function PortfolioPositionTable({
  positions,
  variant,
  emptyMessage,
}: PortfolioPositionTableProps) {
  if (positions.length === 0) {
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
            <th className="px-4 py-3 font-medium">Market</th>
            <th className="px-4 py-3 font-medium">Position</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Avg cost</th>
            <th className="px-4 py-3 font-medium">
              {variant === "open" ? "Current" : "Settlement"}
            </th>
            <th className="px-4 py-3 text-right font-medium">P/L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {positions.map((position) => {
            const avgCost = averageCostPerShare(
              position.cost_basis_credits,
              position.yes_shares,
              position.no_shares,
            );
            const pnl = positionPnl(position, variant);

            return (
              <tr key={position.market_id} className="hover:bg-surface/60">
                <td className="px-4 py-4">
                  <Link
                    to={`/markets/${position.market_id}`}
                    className="font-display font-medium text-ink hover:underline"
                  >
                    {position.market_title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                    <span>{formatMarketStatus(position.market_status)}</span>
                    <OutcomeBadge position={position} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={[
                      "font-data tabular-nums",
                      position.yes_shares >= position.no_shares
                        ? "text-yes"
                        : "text-no",
                    ].join(" ")}
                  >
                    {formatPositionSide(position.yes_shares, position.no_shares)}
                  </span>
                </td>
                <td className="hidden px-4 py-4 font-data tabular-nums text-ink sm:table-cell">
                  {avgCost !== null ? `${avgCost.toLocaleString()} cr` : "—"}
                </td>
                <td className="px-4 py-4 font-data tabular-nums text-ink">
                  {formatPriceFromBps(position.yes_price_bps)}
                </td>
                <td
                  className={[
                    "px-4 py-4 text-right font-data tabular-nums",
                    pnlColorClass(pnl),
                  ].join(" ")}
                >
                  {formatCredits(pnl)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
