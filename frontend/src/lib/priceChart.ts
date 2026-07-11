/**
 * Pure transforms for the YES price chart (kept separate for unit tests).
 */

import type { PricePoint } from "../types/market";

export interface ChartRow {
  trade_id: number;
  timeLabel: string;
  yesPrice: number;
  yes_price_bps: number;
  created_at: string;
}

/** Map API price-history points into Recharts-friendly rows. */
export function toChartRows(points: PricePoint[]): ChartRow[] {
  return points.map((point) => {
    const date = new Date(point.created_at);
    return {
      trade_id: point.trade_id,
      timeLabel: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      yesPrice: point.yes_price_bps / 10000,
      yes_price_bps: point.yes_price_bps,
      created_at: point.created_at,
    };
  });
}

/** Latest YES price in bps, falling back to the market snapshot. */
export function latestYesPriceBps(
  points: PricePoint[],
  fallbackBps: number,
): number {
  if (points.length === 0) return fallbackBps;
  return points[points.length - 1].yes_price_bps;
}

/** True when price series is monotonic non-decreasing in trade_id order. */
export function isChronologicalByTradeId(points: PricePoint[]): boolean {
  for (let i = 1; i < points.length; i += 1) {
    if (points[i].trade_id < points[i - 1].trade_id) return false;
  }
  return true;
}

/** All YES prices must be in [0, 10000] for a valid chart domain. */
export function allPricesInValidBpsRange(points: PricePoint[]): boolean {
  return points.every(
    (p) =>
      Number.isInteger(p.yes_price_bps) &&
      p.yes_price_bps >= 0 &&
      p.yes_price_bps <= 10000,
  );
}
