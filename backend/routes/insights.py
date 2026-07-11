"""Market insight route (Gemini-backed, read-only).

Explicit-trigger endpoint for the market detail page. All inference logic
lives in ``backend/ai/insight_engine.py``; this handler only loads the market
and its recent trades.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.ai import insight_engine
from backend.database import get_db
from backend.schemas.insight import MarketInsightResponse
from backend.services import market_service

router = APIRouter(prefix="/markets", tags=["insights"])


@router.get("/{market_id}/insight", response_model=MarketInsightResponse)
def get_market_insight(
    market_id: uuid.UUID, db: Session = Depends(get_db)
) -> MarketInsightResponse:
    market = market_service.get_market(db, market_id)
    if market is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Market not found")
    trades = market_service.get_price_history(db, market_id)
    return insight_engine.get_insight_with_fallback(market, trades)
