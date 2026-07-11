"""Trade history read helpers.

Market-wide feeds and authenticated user activity lists. Execution stays in
``trade_service``; this module is read-only.
"""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.market import Market
from backend.models.trade import Trade
from backend.schemas.trade import TradeHistoryItem, UserTradeHistoryItem


def _clamp_limit(limit: int) -> int:
    return max(1, min(limit, 500))


def list_market_trades(
    db: Session, market_id: uuid.UUID, *, limit: int = 100
) -> list[TradeHistoryItem]:
    """Public trade feed for one market (includes bot trades)."""
    rows = db.execute(
        select(Trade)
        .where(Trade.market_id == market_id)
        .order_by(Trade.id.desc())
        .limit(_clamp_limit(limit))
    ).scalars()
    return [TradeHistoryItem.model_validate(trade) for trade in rows]


def list_user_trades(
    db: Session,
    user_id: uuid.UUID,
    *,
    limit: int = 100,
    market_id: Optional[uuid.UUID] = None,
) -> list[UserTradeHistoryItem]:
    """Authenticated user's trades across markets (bots excluded)."""
    stmt = (
        select(Trade, Market)
        .join(Market, Market.id == Trade.market_id)
        .where(Trade.user_id == user_id, Trade.is_bot.is_(False))
        .order_by(Trade.id.desc())
        .limit(_clamp_limit(limit))
    )
    if market_id is not None:
        stmt = stmt.where(Trade.market_id == market_id)

    rows = db.execute(stmt).all()
    return [
        UserTradeHistoryItem(
            id=trade.id,
            market_id=trade.market_id,
            market_title=market.title,
            market_slug=market.slug,
            side=trade.side,
            shares=trade.shares,
            cost_credits=trade.cost_credits,
            yes_price_bps=trade.yes_price_bps,
            created_at=trade.created_at,
        )
        for trade, market in rows
    ]
