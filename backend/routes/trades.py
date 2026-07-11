"""Trades routes: execute a trade and read a market's trade feed."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user
from backend.auth.user import User
from backend.database import get_db
from backend.models.trade import Trade
from backend.schemas.trade import TradeCreate, TradeHistoryItem, TradeOut
from backend.services import trade_service

router = APIRouter(tags=["trades"])


@router.post("/trades", response_model=TradeOut)
def create_trade(
    payload: TradeCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TradeOut:
    try:
        result = trade_service.execute_trade(
            db,
            user_id=user.id,
            market_id=payload.market_id,
            side=payload.side,
            amount=payload.amount,
        )
    except trade_service.TradeError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return TradeOut(
        trade_id=result.trade_id,
        market_id=payload.market_id,
        side=result.side,
        shares=result.shares,
        cost=result.cost,
        yes_price_bps=result.yes_price_bps,
        balance_after=result.balance_after,
    )


@router.get("/markets/{market_id}/trades", response_model=list[TradeHistoryItem])
def list_market_trades(
    market_id: uuid.UUID,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> list[TradeHistoryItem]:
    limit = max(1, min(limit, 500))
    trades = db.execute(
        select(Trade)
        .where(Trade.market_id == market_id)
        .order_by(Trade.id.desc())
        .limit(limit)
    ).scalars()
    return [TradeHistoryItem.model_validate(t) for t in trades]
