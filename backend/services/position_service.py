"""Position and wallet read helpers.

Computes mark-to-market position values for portfolio views. Trade execution
remains in ``trade_service``; this module is read-only.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.market import Market
from backend.models.position import Position
from backend.models.wallet import Wallet
from backend.schemas.position import PositionOut
from backend.services import amm

BPS_DENOMINATOR = amm.BPS_DENOMINATOR


def market_value_credits(yes_shares: int, no_shares: int, yes_price_bps: int) -> int:
    """Mark-to-market value in integer credits at ``yes_price_bps``."""
    return round(
        (
            yes_shares * yes_price_bps
            + no_shares * (BPS_DENOMINATOR - yes_price_bps)
        )
        / BPS_DENOMINATOR
    )


def position_to_out(position: Position, market: Market) -> PositionOut:
    yes_price_bps = amm.get_yes_price_bps(market.pool_yes, market.pool_no)
    value = market_value_credits(position.yes_shares, position.no_shares, yes_price_bps)
    return PositionOut(
        market_id=position.market_id,
        yes_shares=position.yes_shares,
        no_shares=position.no_shares,
        cost_basis_credits=position.cost_basis_credits,
        realized_pnl=position.realized_pnl,
        market_value_credits=value,
        unrealized_pnl=value - position.cost_basis_credits,
    )


def list_positions(db: Session, user_id: uuid.UUID) -> list[PositionOut]:
    rows = db.execute(
        select(Position, Market)
        .join(Market, Market.id == Position.market_id)
        .where(Position.user_id == user_id)
        .order_by(Position.updated_at.desc())
    ).all()
    return [position_to_out(position, market) for position, market in rows]


def get_position_for_market(
    db: Session, user_id: uuid.UUID, market_id: uuid.UUID
) -> PositionOut | None:
    row = db.execute(
        select(Position, Market)
        .join(Market, Market.id == Position.market_id)
        .where(Position.user_id == user_id, Position.market_id == market_id)
    ).first()
    if row is None:
        return None
    position, market = row
    return position_to_out(position, market)


def get_wallet(db: Session, user_id: uuid.UUID) -> Wallet | None:
    return db.get(Wallet, user_id)
