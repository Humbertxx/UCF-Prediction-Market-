"""Tests for AI Market Brief batch service."""

from backend.models.enums import TradeSide
from backend.services import (
    market_brief_service,
    market_service,
    trade_service,
)


def test_get_ai_market_brief_returns_all_seeded_markets(db, market) -> None:
    brief = market_brief_service.get_ai_market_brief(db)

    assert len(brief.markets) == len(market_service.DEMO_MARKETS)
    slugs = {item.market_slug for item in brief.markets}
    assert slugs == {spec.slug for spec in market_service.DEMO_MARKETS}


def test_get_ai_market_brief_includes_category_and_price(db, market) -> None:
    brief = market_brief_service.get_ai_market_brief(db)
    football = next(
        m for m in brief.markets if m.market_slug == "ucf-football-historical-replay"
    )

    assert football.category == "Sports"
    assert football.yes_price_bps == 5000
    assert football.insight.summary
    assert football.source in ("gemini", "fallback", "cached")


def test_get_ai_market_brief_price_series_tracks_trades(db, market) -> None:
    # Fresh market has no trades -> empty series.
    brief = market_brief_service.get_ai_market_brief(db)
    football = next(
        m for m in brief.markets if m.market_slug == "ucf-football-historical-replay"
    )
    assert football.price_series == []

    # Each executed trade adds one chronological snapshot ending at current price.
    for _ in range(3):
        trade_service.execute_bot_trade(
            db, market_id=market.id, side=TradeSide.yes, amount=200, bot_label="test"
        )

    refreshed = market_brief_service.get_ai_market_brief(db)
    football = next(
        m for m in refreshed.markets if m.market_slug == "ucf-football-historical-replay"
    )
    assert len(football.price_series) == 3
    trade_ids = [p.trade_id for p in football.price_series]
    assert trade_ids == sorted(trade_ids)
    assert football.price_series[-1].yes_price_bps == football.yes_price_bps
