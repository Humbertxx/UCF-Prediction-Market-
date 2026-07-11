"""Positions and wallet routes.

Read-only portfolio endpoints for the authenticated user.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user
from backend.auth.user import User
from backend.database import get_db
from backend.schemas.position import PositionOut
from backend.schemas.wallet import WalletOut
from backend.services import market_service, position_service

router = APIRouter(tags=["positions"])


@router.get("/positions", response_model=list[PositionOut])
def list_my_positions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[PositionOut]:
    return position_service.list_positions(db, user.id)


@router.get("/markets/{market_id}/position", response_model=PositionOut)
def get_my_market_position(
    market_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PositionOut:
    if market_service.get_market(db, market_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Market not found")
    position = position_service.get_position_for_market(db, user.id, market_id)
    if position is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No position in this market")
    return position


@router.get("/me/wallet", response_model=WalletOut)
def get_my_wallet(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> WalletOut:
    wallet = position_service.get_wallet(db, user.id)
    if wallet is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Wallet not found")
    return WalletOut.model_validate(wallet)
