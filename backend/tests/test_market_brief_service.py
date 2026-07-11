"""Tests for AI Market Brief batch service."""

from backend.services import market_brief_service, market_service


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
