"""Pydantic request/response schemas (API contracts)."""

from backend.schemas.auth import GoogleAuthRequest, SupabaseAuthRequest, TokenResponse
from backend.schemas.insight import GeminiInsight, MarketInsight, MarketInsightResponse
from backend.schemas.market import MarketDetailOut, MarketOut, PricePoint
from backend.schemas.position import PositionOut
from backend.schemas.trade import TradeCreate, TradeOut
from backend.schemas.wallet import WalletOut

__all__ = [
    "GoogleAuthRequest",
    "SupabaseAuthRequest",
    "TokenResponse",
    "MarketOut",
    "MarketDetailOut",
    "PricePoint",
    "TradeCreate",
    "TradeOut",
    "PositionOut",
    "WalletOut",
    "GeminiInsight",
    "MarketInsight",
    "MarketInsightResponse",
]
