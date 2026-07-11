/**
 * Market list card — title, status, and probability bar for fast scanning.
 */

import { Link } from "react-router-dom";

import {
  formatMarketStatus,
  formatPriceFromBps,
} from "../../lib/marketFormat";
import type { MarketSummary } from "../../types/market";
import ProbabilityBar from "./ProbabilityBar";

interface MarketCardProps {
  market: MarketSummary;
}

export default function MarketCard({ market }: MarketCardProps) {
  return (
    <Link
      to={`/markets/${market.id}`}
      className="group block rounded-card border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-ink group-hover:text-gold-ink">
          {market.title}
        </h2>
        <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs text-muted">
          {formatMarketStatus(market.status)}
        </span>
      </div>

      <ProbabilityBar
        yesPriceBps={market.yes_price_bps}
        className="mt-4"
        showLabels={false}
      />

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-data tabular-nums text-ink">
          YES {formatPriceFromBps(market.yes_price_bps)}
        </span>
        <span className="text-muted">View market →</span>
      </div>
    </Link>
  );
}
