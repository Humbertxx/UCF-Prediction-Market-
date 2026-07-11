"""Tests for market read/seed service."""

from sqlalchemy.orm import Session

from backend.models.enums import MarketStatus
from backend.models.enums import TradeSide
from backend.services import market_service, trade_service


def test_seed_demo_markets_creates_three_markets(db: Session) -> None:
    created = market_service.seed_demo_markets(db)
    assert len(created) == 3
    assert len(market_service.list_markets(db)) == 3


def test_seed_demo_markets_is_idempotent(db: Session) -> None:
    market_service.seed_demo_markets(db)
    created_again = market_service.seed_demo_markets(db)
    assert created_again == []
    assert len(market_service.list_markets(db)) == 3


def test_demo_markets_open_at_fifty_fifty(db: Session) -> None:
    market_service.seed_demo_markets(db)
    market = market_service.get_market_by_slug(db, "ucf-football-historical-replay")
    assert market is not None
    assert market.status == MarketStatus.trading
    assert market_service.yes_price_bps(market) == 5000


def test_get_price_history_returns_trades_in_order(
    db: Session, user, wallet, market
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=500,
    )
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.no,
        amount=500,
    )

    history = market_service.get_price_history(db, market.id)
    assert len(history) == 2
    assert history[0].id < history[1].id
