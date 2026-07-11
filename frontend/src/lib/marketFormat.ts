/** Formatting helpers for market prices and labels. */

import type { MarketStatus } from "../types/market";

/** Convert basis points (0–10000) to a decimal probability string, e.g. 5000 → "0.50". */
export function formatPriceFromBps(bps: number): string {
  return (bps / 10000).toFixed(2);
}

/** Convert basis points to a whole-percent label, e.g. 5000 → "50%". */
export function formatPercentFromBps(bps: number): string {
  return `${Math.round(bps / 100)}%`;
}

const STATUS_LABELS: Record<MarketStatus, string> = {
  seeded: "Seeded",
  trading: "Open",
  resolving: "Resolving",
  resolved: "Resolved",
};

export function formatMarketStatus(status: MarketStatus): string {
  return STATUS_LABELS[status];
}

/** Format signed integer credits with locale grouping, e.g. +1,250 cr */
export function formatCredits(value: number, suffix = " cr"): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString()}${suffix}`;
}

/** Tailwind class for signed P/L values. */
export function pnlColorClass(value: number): string {
  if (value > 0) return "text-yes";
  if (value < 0) return "text-no";
  return "text-muted";
}

import { OUTCOME } from "./terminology";

/** Human-readable position side label, e.g. "Lock · 12" or "Doubt · 5". */
export function formatPositionSide(
  yesShares: number,
  noShares: number,
): string {
  if (yesShares > 0 && noShares > 0) {
    return `${OUTCOME.yes.label} · ${yesShares.toLocaleString()} · ${OUTCOME.no.label} · ${noShares.toLocaleString()}`;
  }
  if (yesShares > 0) return `${OUTCOME.yes.label} · ${yesShares.toLocaleString()}`;
  if (noShares > 0) return `${OUTCOME.no.label} · ${noShares.toLocaleString()}`;
  return "—";
}

/** Average cost per share in credits (integer rounding). */
export function averageCostPerShare(
  costBasis: number,
  yesShares: number,
  noShares: number,
): number | null {
  const totalShares = yesShares + noShares;
  if (totalShares <= 0) return null;
  return Math.round(costBasis / totalShares);
}

export function isMarketTradeable(status: MarketStatus): boolean {
  return status === "trading" || status === "seeded";
}
