"""Position API schemas."""

import uuid

from pydantic import BaseModel, ConfigDict


class PositionOut(BaseModel):
    """A user's holdings in one market, with derived mark-to-market P/L."""

    model_config = ConfigDict(from_attributes=True)

    market_id: uuid.UUID
    yes_shares: int
    no_shares: int
    cost_basis_credits: int
    realized_pnl: int
    # Mark-to-market value at the current YES price, and unrealized P/L.
    market_value_credits: int
    unrealized_pnl: int
