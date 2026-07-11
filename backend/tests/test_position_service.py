"""Tests for position mark-to-market helpers."""

from sqlalchemy.orm import Session

from backend.models.enums import TradeSide
from backend.models.position import Position
from backend.services import position_service, trade_service


def test_market_value_credits_at_fifty_fifty() -> None:
    value = position_service.market_value_credits(
        yes_shares=1_000, no_shares=1_000, yes_price_bps=5_000
    )
    assert value == 1_000


def test_position_to_out_computes_unrealized_pnl(
    db: Session, user, wallet, market
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=1_000,
    )

    position = db.query(Position).filter_by(user_id=user.id, market_id=market.id).one()
    out = position_service.position_to_out(position, market)

    assert out.yes_shares == position.yes_shares
    assert out.cost_basis_credits == 1_000
    assert out.market_value_credits >= 0
    assert out.unrealized_pnl == out.market_value_credits - out.cost_basis_credits


def test_list_positions_returns_user_holdings(
    db: Session, user, wallet, market
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=250,
    )

    positions = position_service.list_positions(db, user.id)
    assert len(positions) == 1
    assert positions[0].market_id == market.id
