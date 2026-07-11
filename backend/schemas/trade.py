"""Trade API schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from backend.models.enums import TradeSide


class TradeCreate(BaseModel):
    """Payload for placing a trade."""

    market_id: uuid.UUID
    side: TradeSide
    amount: int = Field(gt=0, description="Credits to spend (positive integer).")


class TradeOut(BaseModel):
    """Result of an executed trade."""

    model_config = ConfigDict(from_attributes=True)

    trade_id: int
    market_id: uuid.UUID
    side: TradeSide
    shares: int
    cost: int
    yes_price_bps: int
    balance_after: int


class TradeHistoryItem(BaseModel):
    """A trade row in a market's public trade feed."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    side: TradeSide
    shares: int
    cost_credits: int
    yes_price_bps: int
    is_bot: bool
    bot_label: Optional[str] = None
    created_at: datetime


class UserTradeHistoryItem(BaseModel):
    """A user's trade with market context for portfolio activity."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    market_id: uuid.UUID
    market_title: str
    market_slug: str
    side: TradeSide
    shares: int
    cost_credits: int
    yes_price_bps: int
    created_at: datetime
