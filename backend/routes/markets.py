"""Markets routes: list, detail, and price history.

Handlers stay thin and delegate to ``market_service``.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.market import MarketDetailOut, MarketOut, PricePoint
from backend.services import market_service

router = APIRouter(prefix="/markets", tags=["markets"])


@router.get("", response_model=list[MarketOut])
def list_markets(db: Session = Depends(get_db)) -> list[MarketOut]:
    return [MarketOut.from_market(m) for m in market_service.list_markets(db)]


@router.get("/{market_id}", response_model=MarketDetailOut)
def get_market(market_id: uuid.UUID, db: Session = Depends(get_db)) -> MarketDetailOut:
    market = market_service.get_market(db, market_id)
    if market is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Market not found")
    return MarketDetailOut.from_market(market)


@router.get("/{market_id}/price-history", response_model=list[PricePoint])
def get_price_history(
    market_id: uuid.UUID, db: Session = Depends(get_db)
) -> list[PricePoint]:
    if market_service.get_market(db, market_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Market not found")
    return [
        PricePoint(
            trade_id=trade.id,
            yes_price_bps=trade.yes_price_bps,
            created_at=trade.created_at,
        )
        for trade in market_service.get_price_history(db, market_id)
    ]
