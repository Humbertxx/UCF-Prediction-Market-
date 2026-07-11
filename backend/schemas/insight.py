"""Market insight API schemas (Gemini-backed AI feature).

``GeminiInsight`` is the strict schema handed to Gemini as ``response_schema``:
it only allows the four real trend readings. ``MarketInsight`` is the shape the
API returns to the client and additionally allows ``"unknown"``, which only the
deterministic/static fallbacks use — the model can never claim "unknown".
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from backend.schemas.market import PricePoint

InsightSource = Literal["gemini", "fallback", "cached"]


class GeminiInsight(BaseModel):
    """Structured output contract passed to Gemini via response_schema."""

    summary: str = Field(description="1-2 sentence plain-English read of price action.")
    trend: Literal["bullish_yes", "bearish_yes", "flat", "mixed"]
    confidence: Literal["low", "medium", "high"]
    key_observation: str = Field(
        description="One concrete pattern observed in the trade series."
    )


class MarketInsight(BaseModel):
    """Insight as returned to the client. Fallbacks may use trend='unknown'."""

    summary: str
    trend: Literal["bullish_yes", "bearish_yes", "flat", "mixed", "unknown"]
    confidence: Literal["low", "medium", "high"]
    key_observation: str

    @classmethod
    def from_gemini(cls, insight: GeminiInsight) -> "MarketInsight":
        return cls(**insight.model_dump())


class MarketInsightResponse(BaseModel):
    """Envelope for GET /markets/{market_id}/insight."""

    market_id: uuid.UUID
    generated_at: datetime
    source: InsightSource
    insight: MarketInsight


class MarketBriefItem(BaseModel):
    """One market row for the AI Market Brief features tab."""

    market_id: uuid.UUID
    market_slug: str
    market_title: str
    category: str
    market_status: str
    yes_price_bps: int
    # Chronological YES-price snapshots (one per trade) for the card sparkline.
    price_series: list[PricePoint]
    generated_at: datetime
    source: InsightSource
    insight: MarketInsight


class AiMarketBriefResponse(BaseModel):
    """Batch insight brief across all markets."""

    generated_at: datetime
    markets: list[MarketBriefItem]
