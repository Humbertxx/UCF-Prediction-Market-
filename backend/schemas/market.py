"""Market API schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.models.enums import MarketOutcome, MarketStatus
from backend.models.market import Market
from backend.services import amm


class MarketOut(BaseModel):
    """Summary view used in market lists."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    status: MarketStatus
    pool_yes: int
    pool_no: int
    yes_price_bps: int
    created_at: datetime

    @classmethod
    def from_market(cls, market: Market) -> "MarketOut":
        return cls(
            id=market.id,
            slug=market.slug,
            title=market.title,
            status=market.status,
            pool_yes=market.pool_yes,
            pool_no=market.pool_no,
            yes_price_bps=amm.get_yes_price_bps(market.pool_yes, market.pool_no),
            created_at=market.created_at,
        )


class MarketDetailOut(MarketOut):
    """Full market view for the detail page."""

    description: str
    k_constant: int
    resolution_outcome: Optional[MarketOutcome] = None
    resolved_at: Optional[datetime] = None

    @classmethod
    def from_market(cls, market: Market) -> "MarketDetailOut":
        return cls(
            id=market.id,
            slug=market.slug,
            title=market.title,
            status=market.status,
            pool_yes=market.pool_yes,
            pool_no=market.pool_no,
            yes_price_bps=amm.get_yes_price_bps(market.pool_yes, market.pool_no),
            created_at=market.created_at,
            description=market.description,
            k_constant=market.k_constant,
            resolution_outcome=market.resolution_outcome,
            resolved_at=market.resolved_at,
        )


class PricePoint(BaseModel):
    """A single point in a market's price history (from a trade)."""

    model_config = ConfigDict(from_attributes=True)

    trade_id: int
    yes_price_bps: int
    created_at: datetime
