"""Admin API schemas for bot simulation controls."""

from __future__ import annotations

import uuid
from typing import Literal, Optional

from pydantic import BaseModel, Field


class SimulateStartRequest(BaseModel):
    market_id: uuid.UUID
    bot_label: str = Field(default="belief", max_length=80)
    rng_seed: Optional[int] = Field(
        default=None,
        description="Optional seed for reproducible belief draws in demos/tests.",
    )


class SimulateBurstRequest(BaseModel):
    market_id: uuid.UUID
    trade_count: int = Field(default=10, ge=1, le=100)
    mode: Literal["belief", "scripted"] = "belief"
    bot_label: Optional[str] = Field(default=None, max_length=80)
    rng_seed: Optional[int] = None


class SimulateStopRequest(BaseModel):
    market_id: uuid.UUID


class SimulateStatusResponse(BaseModel):
    market_id: uuid.UUID
    running: bool
    trades_executed: int
    skipped_ticks: int = 0
    last_reason: Optional[str] = None


class SimulateBurstResponse(BaseModel):
    market_id: uuid.UUID
    mode: str
    trades_executed: int
    yes_price_bps: int
