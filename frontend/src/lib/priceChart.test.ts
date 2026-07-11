/**
 * Unit tests for Recharts price-chart data transforms.
 *
 * Evaluates whether API price-history points convert into a valid chart series.
 */

import { describe, expect, it } from "vitest";

import type { PricePoint } from "../types/market";
import {
  allPricesInValidBpsRange,
  isChronologicalByTradeId,
  latestYesPriceBps,
  toChartRows,
} from "./priceChart";

const samplePoints: PricePoint[] = [
  {
    trade_id: 1,
    yes_price_bps: 5000,
    created_at: "2026-07-11T17:00:00.000Z",
  },
  {
    trade_id: 2,
    yes_price_bps: 5400,
    created_at: "2026-07-11T17:00:03.000Z",
  },
  {
    trade_id: 3,
    yes_price_bps: 6100,
    created_at: "2026-07-11T17:00:06.000Z",
  },
];

describe("toChartRows", () => {
  it("maps bps into [0, 1] yesPrice for the Y axis", () => {
    const rows = toChartRows(samplePoints);
    expect(rows).toHaveLength(3);
    expect(rows[0].yesPrice).toBe(0.5);
    expect(rows[1].yesPrice).toBe(0.54);
    expect(rows[2].yesPrice).toBe(0.61);
  });

  it("preserves trade_id and yes_price_bps for tooltips", () => {
    const rows = toChartRows(samplePoints);
    expect(rows[2].trade_id).toBe(3);
    expect(rows[2].yes_price_bps).toBe(6100);
    expect(rows[2].timeLabel.length).toBeGreaterThan(0);
  });

  it("returns empty array for empty history", () => {
    expect(toChartRows([])).toEqual([]);
  });
});

describe("latestYesPriceBps", () => {
  it("uses last history point when present", () => {
    expect(latestYesPriceBps(samplePoints, 5000)).toBe(6100);
  });

  it("falls back to market snapshot when history is empty", () => {
    expect(latestYesPriceBps([], 5123)).toBe(5123);
  });
});

describe("series quality guards", () => {
  it("accepts chronological trade_id order", () => {
    expect(isChronologicalByTradeId(samplePoints)).toBe(true);
  });

  it("rejects out-of-order trade ids", () => {
    const bad = [samplePoints[1], samplePoints[0]];
    expect(isChronologicalByTradeId(bad)).toBe(false);
  });

  it("accepts valid bps range", () => {
    expect(allPricesInValidBpsRange(samplePoints)).toBe(true);
  });

  it("rejects out-of-range bps", () => {
    expect(
      allPricesInValidBpsRange([
        { trade_id: 1, yes_price_bps: 10001, created_at: samplePoints[0].created_at },
      ]),
    ).toBe(false);
  });
});
