"""Position API schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from backend.models.enums import MarketOutcome, MarketStatus


class PositionOut(BaseModel):
    """A user's holdings in one market, with derived mark-to-market P/L."""

    model_config = ConfigDict(from_attributes=True)

    market_id: uuid.UUID
    market_title: str
    market_slug: str
    market_status: MarketStatus
    yes_price_bps: int
    resolution_outcome: Optional[MarketOutcome] = None
    resolved_at: Optional[datetime] = None
    yes_shares: int
    no_shares: int
    cost_basis_credits: int
    realized_pnl: int
    # Mark-to-market value at the current YES price, and unrealized P/L.
    market_value_credits: int
    unrealized_pnl: int
