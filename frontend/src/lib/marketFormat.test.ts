/**
 * Unit tests for market formatting helpers used across market UI.
 */

import { describe, expect, it } from "vitest";

import {
  formatCredits,
  formatMarketStatus,
  formatPercentFromBps,
  formatPositionSide,
  formatPriceFromBps,
  isMarketTradeable,
  pnlColorClass,
  averageCostPerShare,
} from "./marketFormat";

describe("formatPriceFromBps", () => {
  it("formats midpoint as 0.50", () => {
    expect(formatPriceFromBps(5000)).toBe("0.50");
  });

  it("formats extremes", () => {
    expect(formatPriceFromBps(0)).toBe("0.00");
    expect(formatPriceFromBps(10000)).toBe("1.00");
  });

  it("keeps two decimal places for partial prices", () => {
    expect(formatPriceFromBps(6123)).toBe("0.61");
  });
});

describe("formatPercentFromBps", () => {
  it("rounds to whole percents", () => {
    expect(formatPercentFromBps(5000)).toBe("50%");
    expect(formatPercentFromBps(7200)).toBe("72%");
    expect(formatPercentFromBps(4550)).toBe("46%");
  });
});

describe("formatMarketStatus", () => {
  it("maps trading to Open for demo copy", () => {
    expect(formatMarketStatus("trading")).toBe("Open");
    expect(formatMarketStatus("resolved")).toBe("Resolved");
  });
});

describe("isMarketTradeable", () => {
  it("allows trading and seeded, blocks resolved", () => {
    expect(isMarketTradeable("trading")).toBe(true);
    expect(isMarketTradeable("seeded")).toBe(true);
    expect(isMarketTradeable("resolved")).toBe(false);
    expect(isMarketTradeable("resolving")).toBe(false);
  });
});

describe("pnl and credits helpers", () => {
  it("formats signed credits", () => {
    expect(formatCredits(1250)).toContain("+");
    expect(formatCredits(-40)).toContain("-");
  });

  it("maps pnl color tokens", () => {
    expect(pnlColorClass(10)).toBe("text-yes");
    expect(pnlColorClass(-10)).toBe("text-no");
    expect(pnlColorClass(0)).toBe("text-muted");
  });

  it("formats position sides", () => {
    expect(formatPositionSide(12, 0)).toBe("Lock · 12");
    expect(formatPositionSide(0, 5)).toBe("Doubt · 5");
    expect(formatPositionSide(0, 0)).toBe("—");
  });

  it("averages cost per share", () => {
    expect(averageCostPerShare(100, 4, 0)).toBe(25);
    expect(averageCostPerShare(100, 0, 0)).toBeNull();
  });
});
