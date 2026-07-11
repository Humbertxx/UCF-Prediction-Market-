"""User profile stats — volume, total P/L, and category breakdown."""

from __future__ import annotations

import uuid
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.auth.user import User
from backend.models.market import Market
from backend.models.position import Position
from backend.models.trade import Trade
from backend.schemas.user import CategoryPnlOut, UserProfileStatsData
from backend.services import position_service
from backend.services.market_service import infer_market_category


class ServiceError(Exception):
    """Domain error surfaced to routes as a JSON envelope."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _username_for(user: User) -> str:
    if user.name and user.name.strip():
        return user.name.strip()
    local = user.email.split("@", 1)[0]
    return local or user.email


def get_user_profile_stats(db: Session, user_id: uuid.UUID) -> UserProfileStatsData:
    user = db.get(User, user_id)
    if user is None:
        raise ServiceError("User not found", status_code=404)

    volume = db.execute(
        select(func.coalesce(func.sum(Trade.cost_credits), 0)).where(
            Trade.user_id == user_id,
            Trade.is_bot.is_(False),
        )
    ).scalar_one()

    rows = db.execute(
        select(Position, Market)
        .join(Market, Market.id == Position.market_id)
        .where(Position.user_id == user_id)
    ).all()

    total_pnl = 0
    category_totals: dict[str, int] = defaultdict(int)

    for position, market in rows:
        out = position_service.position_to_out(position, market)
        pnl = out.realized_pnl + out.unrealized_pnl
        total_pnl += pnl
        category = infer_market_category(market.slug)
        category_totals[category] += pnl

    category_pnl = [
        CategoryPnlOut(category=category, pnl_credits=pnl)
        for category, pnl in sorted(category_totals.items())
    ]

    return UserProfileStatsData(
        id=str(user.id),
        email=user.email,
        name=user.name,
        profile_picture=user.profile_picture,
        username=_username_for(user),
        total_volume_credits=int(volume),
        total_pnl_credits=total_pnl,
        category_pnl=category_pnl,
    )
