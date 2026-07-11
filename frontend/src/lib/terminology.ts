/**
 * User-facing outcome labels. API and DB still use yes/no internally.
 */

import type { TradeSide } from "../types/market";

export const OUTCOME = {
  yes: {
    label: "Lock",
    buyLabel: "Lock In",
    buyingLabel: "Locking in…",
    tradeVerb: "locked",
    resolved: "Locked",
  },
  no: {
    label: "Doubt",
    buyLabel: "Doubt It",
    buyingLabel: "Doubting…",
    tradeVerb: "doubted",
    resolved: "Doubted",
  },
} as const;

export function outcomeLabel(side: TradeSide): string {
  return OUTCOME[side].label;
}

export function outcomeBuyLabel(side: TradeSide): string {
  return OUTCOME[side].buyLabel;
}

export function outcomeBuyingLabel(side: TradeSide): string {
  return OUTCOME[side].buyingLabel;
}

export function outcomeResolvedLabel(isYes: boolean): string {
  return isYes ? OUTCOME.yes.resolved : OUTCOME.no.resolved;
}

/** e.g. "Locked 5 Lock" for trade feed lines */
export function formatTradeSideAction(
  side: TradeSide,
  shares: number,
): string {
  const o = OUTCOME[side];
  const text = `${o.tradeVerb} ${shares} ${o.label}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
