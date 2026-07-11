"""Unit tests for atomic trade execution."""

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.enums import MarketStatus, TradeSide
from backend.models.position import Position
from backend.models.trade import Trade
from backend.models.wallet import Wallet
from backend.services import trade_service


def test_execute_trade_updates_pools_wallet_position_and_trade(
    db: Session, user, wallet, market
) -> None:
    starting_balance = wallet.balance_credits
    starting_yes = market.pool_yes

    result = trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=1_000,
    )

    db.refresh(market)
    db.refresh(wallet)
    position = db.execute(
        select(Position).where(
            Position.user_id == user.id, Position.market_id == market.id
        )
    ).scalar_one()
    trade = db.get(Trade, result.trade_id)

    assert result.cost == 1_000
    assert result.shares > 0
    assert result.balance_after == starting_balance - 1_000
    assert wallet.balance_credits == result.balance_after
    assert market.pool_yes < starting_yes
    assert position.yes_shares == result.shares
    assert position.cost_basis_credits == 1_000
    assert trade is not None
    assert trade.pool_yes_after == market.pool_yes
    assert trade.pool_no_after == market.pool_no


def test_execute_trade_rejects_insufficient_balance(
    db: Session, user, wallet, market
) -> None:
    wallet.balance_credits = 50
    db.commit()

    with pytest.raises(trade_service.TradeError) as exc:
        trade_service.execute_trade(
            db,
            user_id=user.id,
            market_id=market.id,
            side=TradeSide.yes,
            amount=1_000,
        )

    assert exc.value.status_code == 402
    assert "Insufficient balance" in exc.value.message


def test_execute_trade_rejects_non_trading_market(
    db: Session, user, wallet, seeded_market
) -> None:
    assert seeded_market.status == MarketStatus.seeded

    with pytest.raises(trade_service.TradeError) as exc:
        trade_service.execute_trade(
            db,
            user_id=user.id,
            market_id=seeded_market.id,
            side=TradeSide.no,
            amount=100,
        )

    assert exc.value.status_code == 409


def test_execute_trade_rejects_missing_wallet(db: Session, user, market) -> None:
    with pytest.raises(trade_service.TradeError) as exc:
        trade_service.execute_trade(
            db,
            user_id=user.id,
            market_id=market.id,
            side=TradeSide.yes,
            amount=100,
        )

    assert exc.value.status_code == 404
    assert "Wallet not found" in exc.value.message
