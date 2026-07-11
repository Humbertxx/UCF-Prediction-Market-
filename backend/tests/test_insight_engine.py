"""Insight engine tests using hardcoded fixture trades (no Gemini calls).

Covers the degradation ladder: too-few-trades short-circuit, missing API key,
cache hits, stale-cache-on-failure, and the prompt's data hygiene (no hidden
p_true, no user identifiers).
"""

import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

from backend.ai import insight_engine
from backend.schemas.insight import MarketInsight


def make_market(**overrides):
    defaults = {
        "id": uuid.uuid4(),
        "title": "UCF football historical replay: does UCF win?",
        "status": "trading",
        "pool_yes": 80_000,
        "pool_no": 125_000,
        "p_true_bps": 7200,
    }
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def make_trades(count: int):
    start = datetime(2026, 7, 11, 14, 0, tzinfo=timezone.utc)
    return [
        SimpleNamespace(
            created_at=start + timedelta(minutes=i),
            side="yes" if i % 3 else "no",
            cost_credits=100,
            shares=180,
            yes_price_bps=5000 + i * 25,
            is_bot=i % 2 == 0,
        )
        for i in range(count)
    ]


SAMPLE_INSIGHT = MarketInsight(
    summary="YES has been climbing steadily.",
    trend="bullish_yes",
    confidence="medium",
    key_observation="YES buying accelerated over the last 5 trades.",
)


@pytest.fixture(autouse=True)
def clear_cache():
    insight_engine._cache.clear()
    yield
    insight_engine._cache.clear()


@pytest.fixture
def with_api_key(monkeypatch):
    settings = SimpleNamespace(gemini_api_key="test-key")
    monkeypatch.setattr(insight_engine, "get_settings", lambda: settings)


@pytest.fixture
def without_api_key(monkeypatch):
    settings = SimpleNamespace(gemini_api_key="")
    monkeypatch.setattr(insight_engine, "get_settings", lambda: settings)


def test_too_few_trades_short_circuits_before_gemini(with_api_key, monkeypatch):
    def boom(*args, **kwargs):
        raise AssertionError("generate_insight must not be called")

    monkeypatch.setattr(insight_engine, "generate_insight", boom)
    response = insight_engine.get_insight_with_fallback(make_market(), make_trades(2))
    assert response.source == "fallback"
    assert response.insight.trend == "unknown"
    assert response.insight.confidence == "low"


def test_missing_key_returns_static_fallback(without_api_key):
    response = insight_engine.get_insight_with_fallback(make_market(), make_trades(10))
    assert response.source == "fallback"
    assert response.insight == insight_engine.STATIC_FALLBACK


def test_success_then_cache_hit(with_api_key, monkeypatch):
    calls = []

    def fake_generate(market, trades):
        calls.append(market.id)
        return SAMPLE_INSIGHT

    monkeypatch.setattr(insight_engine, "generate_insight", fake_generate)
    market = make_market()

    first = insight_engine.get_insight_with_fallback(market, make_trades(10))
    second = insight_engine.get_insight_with_fallback(market, make_trades(10))

    assert first.source == "gemini"
    assert second.source == "cached"
    assert second.insight == SAMPLE_INSIGHT
    assert len(calls) == 1


def test_failure_serves_stale_cache(with_api_key, monkeypatch):
    market = make_market()
    # Seed an expired cache entry, then make generation fail.
    insight_engine._cache[market.id] = (-10_000.0, SAMPLE_INSIGHT)

    def fail(*args, **kwargs):
        raise RuntimeError("gemini down")

    monkeypatch.setattr(insight_engine, "generate_insight", fail)
    response = insight_engine.get_insight_with_fallback(market, make_trades(10))
    assert response.source == "cached"
    assert response.insight == SAMPLE_INSIGHT


def test_failure_without_cache_serves_static_fallback(with_api_key, monkeypatch):
    def fail(*args, **kwargs):
        raise RuntimeError("gemini down")

    monkeypatch.setattr(insight_engine, "generate_insight", fail)
    response = insight_engine.get_insight_with_fallback(make_market(), make_trades(10))
    assert response.source == "fallback"
    assert response.insight == insight_engine.STATIC_FALLBACK


def test_prompt_contains_series_but_no_secrets():
    market = make_market()
    trades = make_trades(60)
    prompt = insight_engine.build_prompt(market, trades)

    assert insight_engine.PROMPT_VERSION in prompt
    assert market.title in prompt
    assert "series_stats" in prompt
    assert "STRICT GROUNDING RULES" in prompt
    assert "sole source of truth" in prompt.lower()
    # Only the most recent MAX_TRADES_IN_PROMPT trades are included.
    assert prompt.count('"price_bps"') == insight_engine.MAX_TRADES_IN_PROMPT
    # Hidden demo secret and user-identifying fields never reach the model.
    assert "p_true" not in prompt
    assert "7200" not in prompt
    assert "user_id" not in prompt
    assert '"email"' not in prompt


def test_insight_endpoint_fallback_and_404(client, market, monkeypatch):
    settings = SimpleNamespace(gemini_api_key="")
    monkeypatch.setattr(insight_engine, "get_settings", lambda: settings)

    ok = client.get(f"/markets/{market.id}/insight")
    assert ok.status_code == 200
    body = ok.json()
    assert body["market_id"] == str(market.id)
    assert body["source"] == "fallback"
    assert set(body["insight"]) == {"summary", "trend", "confidence", "key_observation"}

    missing = client.get(f"/markets/{uuid.uuid4()}/insight")
    assert missing.status_code == 404
