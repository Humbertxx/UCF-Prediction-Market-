/**
 * Market insight panel (Gemini-backed).
 *
 * Purpose:
 * - Secondary card on the market detail page explaining recent price action.
 *
 * Intended behavior:
 * - Gated behind an explicit "Get insight" click (cost control).
 * - States: idle -> loading -> success | error; fallback responses render as
 *   calm, readable copy — never a scary error banner.
 * - Never blocks or overlays the probability bar or trade panel.
 */

import { InsightConfidence, InsightTrend } from "../../lib/api";
import { useInsight } from "../../hooks/useInsight";

const TREND_LABELS: Record<InsightTrend, { label: string; className: string }> = {
  bullish_yes: { label: "YES trending up", className: "text-yes" },
  bearish_yes: { label: "YES trending down", className: "text-no" },
  flat: { label: "Flat", className: "text-muted" },
  mixed: { label: "Mixed", className: "text-muted" },
  unknown: { label: "No read yet", className: "text-muted" },
};

const CONFIDENCE_LABELS: Record<InsightConfidence, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

interface MarketInsightProps {
  marketId: string;
}

export default function MarketInsight({ marketId }: MarketInsightProps) {
  const { status, data, fetchInsight } = useInsight(marketId);
  const insight = data?.insight;
  const trend = insight ? TREND_LABELS[insight.trend] : null;

  return (
    <section className="rounded-card bg-card border border-line p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-ink text-base">Market insight</h2>
        <button
          type="button"
          onClick={fetchInsight}
          disabled={status === "loading"}
          className="rounded-btn border border-line px-3 py-1.5 text-sm text-ink hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold disabled:opacity-50"
        >
          {status === "idle" ? "Get insight" : "Refresh insight"}
        </button>
      </div>

      {status === "idle" && (
        <p className="mt-3 text-sm text-muted">
          Get a plain-English read of recent trading on this market.
        </p>
      )}

      {status === "loading" && (
        <p className="mt-3 text-sm text-muted" role="status">
          Reading recent trades…
        </p>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-muted">
          Couldn&apos;t load an insight right now. Watch the probability bar for
          live price moves, then try again.
        </p>
      )}

      {status === "success" && insight && trend && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full border border-line px-2 py-0.5 ${trend.className}`}
            >
              {trend.label}
            </span>
            <span className="rounded-full border border-line px-2 py-0.5 text-muted">
              {CONFIDENCE_LABELS[insight.confidence]}
            </span>
          </div>
          <p className="text-sm text-ink">{insight.summary}</p>
          <p className="text-sm text-muted">{insight.key_observation}</p>
          {data?.source === "fallback" && (
            <p className="text-xs text-muted">
              Live insight is unavailable — this is a general note, not a read
              of current trades.
            </p>
          )}
          <p className="text-xs text-muted">
            Simulation - virtual credits - no cash value
          </p>
        </div>
      )}
    </section>
  );
}
