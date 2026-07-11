"""Tests for trade history read helpers."""

from backend.models.enums import TradeSide
from backend.services import trade_history_service, trade_service


def test_list_market_trades_includes_bots(db, market) -> None:
    trade_service.execute_bot_trade(
        db,
        market_id=market.id,
        side=TradeSide.yes,
        amount=100,
        bot_label="belief",
    )

    trades = trade_history_service.list_market_trades(db, market.id)
    assert len(trades) == 1
    assert trades[0].is_bot is True


def test_list_user_trades_excludes_bots(
    db, user, wallet, market
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=250,
    )
    trade_service.execute_bot_trade(
        db,
        market_id=market.id,
        side=TradeSide.no,
        amount=100,
    )

    trades = trade_history_service.list_user_trades(db, user.id)
    assert len(trades) == 1
    assert trades[0].market_title == market.title
    assert trades[0].market_slug == market.slug
    assert trades[0].cost_credits == 250


def test_list_user_trades_filters_by_market(
    db, user, wallet, market
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=100,
    )

    trades = trade_history_service.list_user_trades(
        db, user.id, market_id=market.id
    )
    assert len(trades) == 1

    import uuid

    empty = trade_history_service.list_user_trades(
        db, user.id, market_id=uuid.uuid4()
    )
    assert empty == []
