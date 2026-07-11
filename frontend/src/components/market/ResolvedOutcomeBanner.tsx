/**
 * Resolved market banner — outcome, settlement time, and optional user P/L.
 */

import {
  formatCredits,
  formatResolvedAt,
  pnlColorClass,
} from "../../lib/marketFormat";
import { outcomeResolvedLabel } from "../../lib/terminology";
import type { MarketOutcome } from "../../types/market";

interface ResolvedOutcomeBannerProps {
  outcome: MarketOutcome;
  resolvedAt: string | null;
  /** When set and user had cost basis, show settlement P/L */
  settlementPnl?: number | null;
}

export default function ResolvedOutcomeBanner({
  outcome,
  resolvedAt,
  settlementPnl = null,
}: ResolvedOutcomeBannerProps) {
  const isYes = outcome === "yes";
  const outcomeLabel = outcomeResolvedLabel(isYes);
  const showPnl = settlementPnl !== null && settlementPnl !== undefined;

  return (
    <section
      role="status"
      aria-live="polite"
      className={[
        "mt-6 rounded-card border px-4 py-4 md:px-6 md:py-5",
        isYes ? "border-yes/30 bg-yes/5" : "border-no/30 bg-no/5",
      ].join(" ")}
    >
      <p className="font-display text-xs font-medium uppercase tracking-[0.12em] text-muted">
        Market resolved
      </p>
      <p className="mt-2 font-display text-xl font-semibold text-ink">
        Outcome:{" "}
        <span className={isYes ? "text-yes" : "text-no"}>{outcomeLabel}</span>
      </p>
      {resolvedAt && (
        <p className="mt-1 text-sm text-muted">
          Settled {formatResolvedAt(resolvedAt)}
        </p>
      )}
      {showPnl && (
        <p className="mt-3 font-data text-sm tabular-nums text-ink">
          Your result:{" "}
          <span className={pnlColorClass(settlementPnl)}>
            {formatCredits(settlementPnl)}
          </span>
        </p>
      )}
    </section>
  );
}
