/**
 * Shared display maps for AI insight fields (market panel + features brief).
 */

import { InsightConfidence, InsightTrend } from "./api";

export const TREND_LABELS: Record<
  InsightTrend,
  { label: string; className: string }
> = {
  bullish_yes: { label: "YES trending up", className: "text-yes" },
  bearish_yes: { label: "YES trending down", className: "text-no" },
  flat: { label: "Flat", className: "text-muted" },
  mixed: { label: "Mixed", className: "text-muted" },
  unknown: { label: "No read yet", className: "text-muted" },
};

export const CONFIDENCE_LABELS: Record<InsightConfidence, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};
