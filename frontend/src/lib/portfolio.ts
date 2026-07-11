/** Portfolio helpers — split positions into open vs settled history. */

import type { Position } from "../types/market";

export function isOpenPosition(position: Position): boolean {
  return (
    position.market_status !== "resolved" &&
    (position.yes_shares > 0 || position.no_shares > 0)
  );
}

export function isHistoryPosition(position: Position): boolean {
  return position.market_status === "resolved" && position.cost_basis_credits > 0;
}

export function splitPortfolioPositions(positions: Position[]): {
  open: Position[];
  history: Position[];
} {
  const open: Position[] = [];
  const history: Position[] = [];

  for (const position of positions) {
    if (isOpenPosition(position)) {
      open.push(position);
      continue;
    }
    if (isHistoryPosition(position)) {
      history.push(position);
    }
  }

  return { open, history };
}

export function portfolioPositionValue(positions: Position[]): number {
  return positions.reduce((sum, position) => sum + position.market_value_credits, 0);
}

export function portfolioOpenPnl(positions: Position[]): number {
  return positions.reduce((sum, position) => sum + position.unrealized_pnl, 0);
}
