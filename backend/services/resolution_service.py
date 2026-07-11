"""Market resolution and position payout service.

Admin-triggered settlement: marks a market resolved, credits winning shares to
wallets, and records realized P/L on each position.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.enums import MarketOutcome, MarketStatus
from backend.models.market import Market
from backend.models.position import Position
from backend.models.wallet import Wallet
from backend.services import position_service

BPS_DENOMINATOR = position_service.BPS_DENOMINATOR


class ResolutionError(Exception):
    """Raised when a market cannot be resolved."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


@dataclass
class ResolutionResult:
    market_id: uuid.UUID
    outcome: MarketOutcome
    positions_settled: int
    total_payout_credits: int
    resolved_at: datetime


def _settlement_yes_price_bps(outcome: MarketOutcome) -> int:
    if outcome == MarketOutcome.yes:
        return BPS_DENOMINATOR
    return 0


def resolve_market(
    db: Session,
    *,
    market_id: uuid.UUID,
    outcome: MarketOutcome,
    resolved_by: uuid.UUID,
    evidence: str | None = None,
) -> ResolutionResult:
    """Resolve a market and pay out all user positions atomically."""
    market = db.execute(
        select(Market).where(Market.id == market_id).with_for_update()
    ).scalar_one_or_none()
    if market is None:
        raise ResolutionError("Market not found", status_code=404)
    if market.status == MarketStatus.resolved:
        raise ResolutionError("Market is already resolved", status_code=409)
    if market.status not in (MarketStatus.trading, MarketStatus.resolving):
        raise ResolutionError("Market is not open for resolution", status_code=409)

    settlement_bps = _settlement_yes_price_bps(outcome)
    positions = db.execute(
        select(Position).where(Position.market_id == market_id).with_for_update()
    ).scalars().all()

    positions_settled = 0
    total_payout = 0

    for position in positions:
        if (
            position.yes_shares == 0
            and position.no_shares == 0
            and position.cost_basis_credits == 0
        ):
            continue

        payout = position_service.market_value_credits(
            position.yes_shares,
            position.no_shares,
            settlement_bps,
        )
        position.realized_pnl = payout - position.cost_basis_credits

        if payout > 0:
            wallet = db.execute(
                select(Wallet)
                .where(Wallet.user_id == position.user_id)
                .with_for_update()
            ).scalar_one_or_none()
            if wallet is None:
                raise ResolutionError(
                    f"Wallet not found for user {position.user_id}",
                    status_code=500,
                )
            wallet.balance_credits += payout
            total_payout += payout

        positions_settled += 1

    resolved_at = datetime.now(timezone.utc)
    market.status = MarketStatus.resolved
    market.resolution_outcome = outcome
    market.resolved_at = resolved_at
    market.resolved_by = resolved_by
    market.resolution_evidence = evidence

    db.commit()

    return ResolutionResult(
        market_id=market_id,
        outcome=outcome,
        positions_settled=positions_settled,
        total_payout_credits=total_payout,
        resolved_at=resolved_at,
    )
