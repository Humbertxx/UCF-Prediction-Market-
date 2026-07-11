"""Trade history API routes.

Market trade feeds and authenticated user activity.
"""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user
from backend.auth.user import User
from backend.database import get_db
from backend.schemas.trade import TradeHistoryItem, UserTradeHistoryItem
from backend.services import market_service, trade_history_service

router = APIRouter(tags=["trade-history"])


@router.get("/users/me/trades", response_model=list[UserTradeHistoryItem])
def list_my_trades(
    limit: int = 100,
    market_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[UserTradeHistoryItem]:
    return trade_history_service.list_user_trades(
        db, user.id, limit=limit, market_id=market_id
    )


@router.get("/markets/{market_id}/trades", response_model=list[TradeHistoryItem])
def list_market_trades(
    market_id: uuid.UUID,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> list[TradeHistoryItem]:
    if market_service.get_market(db, market_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Market not found")
    return trade_history_service.list_market_trades(db, market_id, limit=limit)
