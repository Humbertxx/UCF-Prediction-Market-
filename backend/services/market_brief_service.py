"""AI Market Brief service — batch insights for the features tab.

Loads each market's trade series and delegates to ``insight_engine`` so caching
and Gemini fallbacks stay centralized.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.ai import insight_engine
from backend.schemas.insight import AiMarketBriefResponse, MarketBriefItem
from backend.services import amm, market_service


def get_ai_market_brief(db: Session) -> AiMarketBriefResponse:
    """Return an insight brief for every market (demo-safe, read-only)."""
    items: list[MarketBriefItem] = []

    for market in market_service.list_markets(db):
        trades = market_service.get_price_history(db, market.id)
        insight_response = insight_engine.get_insight_with_fallback(market, trades)
        items.append(
            MarketBriefItem(
                market_id=market.id,
                market_slug=market.slug,
                market_title=market.title,
                category=market_service.infer_market_category(market.slug),
                market_status=getattr(market.status, "value", market.status),
                yes_price_bps=amm.get_yes_price_bps(market.pool_yes, market.pool_no),
                generated_at=insight_response.generated_at,
                source=insight_response.source,
                insight=insight_response.insight,
            )
        )

    return AiMarketBriefResponse(
        generated_at=datetime.now(timezone.utc),
        markets=items,
    )
