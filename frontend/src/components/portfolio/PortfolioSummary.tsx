/**
 * Portfolio summary — cash balance and open position value (Kalshi-style header).
 */

import {
  formatCredits,
  pnlColorClass,
} from "../../lib/marketFormat";
import { portfolioOpenPnl, portfolioPositionValue } from "../../lib/portfolio";
import type { Position, Wallet } from "../../types/market";

interface PortfolioSummaryProps {
  wallet: Wallet | null;
  openPositions: Position[];
  walletLoading?: boolean;
}

export default function PortfolioSummary({
  wallet,
  openPositions,
  walletLoading = false,
}: PortfolioSummaryProps) {
  const positionValue = portfolioPositionValue(openPositions);
  const openPnl = portfolioOpenPnl(openPositions);
  const cash = wallet?.balance_credits ?? 0;
  const totalValue = cash + positionValue;

  return (
    <section className="rounded-card border border-line bg-card p-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted">Cash</p>
          <p className="mt-1 font-data text-xl tabular-nums text-ink">
            {walletLoading ? "…" : `${cash.toLocaleString()} cr`}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted">Position value</p>
          <p className="mt-1 font-data text-xl tabular-nums text-ink">
            {positionValue.toLocaleString()} cr
          </p>
        </div>
        <div>
          <p className="text-sm text-muted">Portfolio total</p>
          <p className="mt-1 font-data text-xl tabular-nums text-ink">
            {walletLoading ? "…" : `${totalValue.toLocaleString()} cr`}
          </p>
        </div>
      </div>

      {openPositions.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          Open P/L{" "}
          <span className={`font-data tabular-nums ${pnlColorClass(openPnl)}`}>
            {formatCredits(openPnl)}
          </span>
        </p>
      )}
    </section>
  );
}
