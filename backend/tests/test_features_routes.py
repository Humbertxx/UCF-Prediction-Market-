"""Features route tests (Gemini key blanked so tests never call the real API)."""

from types import SimpleNamespace

import pytest

from backend.ai import insight_engine
from backend.services import market_service


@pytest.fixture(autouse=True)
def force_insight_fallback(monkeypatch):
    monkeypatch.setattr(
        insight_engine, "get_settings", lambda: SimpleNamespace(gemini_api_key="")
    )
    insight_engine._cache.clear()
    yield
    insight_engine._cache.clear()


def test_ai_market_brief_endpoint(client, market) -> None:
    response = client.get("/features/ai-market-brief")
    assert response.status_code == 200
    body = response.json()
    assert "generated_at" in body
    assert len(body["markets"]) == len(market_service.DEMO_MARKETS)
    first = body["markets"][0]
    assert "market_title" in first
    assert "category" in first
    assert "insight" in first
    assert "summary" in first["insight"]


def test_ai_market_brief_item_shape(client, market) -> None:
    body = client.get("/features/ai-market-brief").json()
    by_id = {item["market_id"]: item for item in body["markets"]}
    ucf = by_id[str(market.id)]

    assert ucf["market_slug"] == "ucf-football-historical-replay"
    assert ucf["category"] == "Sports"
    assert ucf["market_status"] == "trading"
    assert 0 <= ucf["yes_price_bps"] <= 10000
    # Fresh seeded markets have no trades -> deterministic low-confidence fallback.
    assert ucf["source"] == "fallback"
    assert set(ucf["insight"]) == {"summary", "trend", "confidence", "key_observation"}
    assert ucf["insight"]["confidence"] == "low"


def test_ai_market_brief_requires_no_auth_and_handles_empty_db(client) -> None:
    # No Authorization header and no markets seeded (no `market` fixture).
    response = client.get("/features/ai-market-brief")
    assert response.status_code == 200
    assert response.json()["markets"] == []
