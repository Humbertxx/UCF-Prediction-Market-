"""AI insight generation engine (Gemini-backed).

The only module in the backend allowed to talk to Gemini. Produces a
structured, validated read of a market's recent price action for the market
detail page. Never touches trade execution, pricing, or balances.

Degradation ladder (never raises to the route):
1. Fresh in-memory cache hit -> "cached" (no API call).
2. Fewer than 3 trades -> deterministic low-confidence message (no API call).
3. Missing GEMINI_API_KEY or API failure after retries -> stale cache if any,
   else a static fallback -> "fallback".

Uses the unified ``google-genai`` SDK only (imported lazily so the rest of the
backend never depends on it).
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Optional, Sequence, Tuple

from backend.config import get_settings
from backend.schemas.insight import (
    GeminiInsight,
    InsightSource,
    MarketInsight,
    MarketInsightResponse,
)
from backend.services import amm

logger = logging.getLogger(__name__)

PROMPT_VERSION = "v1"
GEMINI_MODEL = "gemini-2.5-flash"

# Keep prompts compact: only the most recent trades matter for "recent action".
MAX_TRADES_IN_PROMPT = 50
MIN_TRADES_FOR_GENERATION = 3

MAX_ATTEMPTS = 3
BACKOFF_BASE_SECONDS = 1.0
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}

CACHE_TTL_SECONDS = 300.0
# market_id -> (stored_at_monotonic, insight). Stale entries still beat the
# static fallback when the API is down, so they are kept until overwritten.
_cache: Dict[uuid.UUID, Tuple[float, MarketInsight]] = {}

STATIC_FALLBACK = MarketInsight(
    summary="Insight unavailable right now. Watch the probability bar for live price moves.",
    trend="unknown",
    confidence="low",
    key_observation="Try again after a few more trades.",
)


def _too_few_trades_insight(trade_count: int) -> MarketInsight:
    return MarketInsight(
        summary="Not enough trades yet to read a trend on this market.",
        trend="unknown",
        confidence="low",
        key_observation=(
            f"Only {trade_count} trade{'s' if trade_count != 1 else ''} so far. "
            "Check back after a few more land."
        ),
    )


def build_prompt(market, trades: Sequence) -> str:
    """Build the versioned insight prompt from demo market data only.

    Sends market title/status/current price and a compact recent-trade series.
    Never includes user identifiers, wallet balances, or the hidden p_true.
    """
    recent = list(trades)[-MAX_TRADES_IN_PROMPT:]
    payload = {
        "market": {
            "title": market.title,
            "status": getattr(market.status, "value", market.status),
            "current_yes_price_bps": amm.get_yes_price_bps(
                market.pool_yes, market.pool_no
            ),
        },
        "trades": [
            {
                "t": trade.created_at.isoformat() if trade.created_at else None,
                "side": getattr(trade.side, "value", trade.side),
                "price_bps": trade.yes_price_bps,
                "credits": trade.cost_credits,
                "bot": bool(trade.is_bot),
            }
            for trade in recent
        ],
    }
    return (
        f"[prompt_version={PROMPT_VERSION}]\n"
        "You are the market commentary widget for a campus prediction-market "
        "simulation that uses virtual credits with no cash value.\n"
        "Read the recent trade series for one binary YES/NO market and explain "
        "what the price action suggests.\n"
        "Rules:\n"
        "- This is a simulation. Do not give financial advice and do not make "
        "claims about the real-world outcome of the market question.\n"
        "- Speak plainly in terms of credits, shares, and price. Never mention "
        "pools, invariants, liquidity math, or internal mechanics.\n"
        "- price_bps is the YES price in basis points: 6100 means 0.61, i.e. "
        "the crowd prices YES at 61%.\n"
        "- Base every statement only on the data below; 'bot' marks simulated "
        "traders.\n"
        "- trend is from the YES side's perspective: bullish_yes means the YES "
        "price is moving up.\n"
        "- summary: 1-2 short sentences. key_observation: one concrete pattern "
        "from the trades, e.g. 'YES buying accelerated over the last 5 trades.'\n"
        "Respond with JSON matching the provided schema.\n\n"
        f"Market data:\n{json.dumps(payload, indent=2)}\n"
    )


def _get_client(api_key: str):
    from google import genai

    return genai.Client(api_key=api_key)


def generate_insight(market, trades: Sequence) -> MarketInsight:
    """Call Gemini with structured output; validate before returning.

    Retries with exponential backoff on rate limits / transient server errors
    (max 3 attempts). Raises on exhaustion or malformed output; callers should
    use :func:`get_insight_with_fallback`.
    """
    from google.genai import errors, types

    settings = get_settings()
    prompt = build_prompt(market, trades)
    logger.info(
        "insight: calling gemini model=%s prompt_version=%s market=%s trades=%d",
        GEMINI_MODEL,
        PROMPT_VERSION,
        market.id,
        min(len(trades), MAX_TRADES_IN_PROMPT),
    )

    client = _get_client(settings.gemini_api_key)
    last_error: Optional[Exception] = None
    for attempt in range(MAX_ATTEMPTS):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GeminiInsight,
                    temperature=0.4,
                ),
            )
            validated = GeminiInsight.model_validate_json(response.text or "")
            return MarketInsight.from_gemini(validated)
        except errors.APIError as exc:
            last_error = exc
            if exc.code in _RETRYABLE_STATUS_CODES and attempt < MAX_ATTEMPTS - 1:
                delay = BACKOFF_BASE_SECONDS * (2**attempt)
                logger.warning(
                    "insight: gemini error code=%s attempt=%d, retrying in %.1fs",
                    exc.code,
                    attempt + 1,
                    delay,
                )
                time.sleep(delay)
                continue
            raise
    raise last_error  # pragma: no cover - loop always returns or raises


def _cache_get(market_id: uuid.UUID, allow_stale: bool) -> Optional[MarketInsight]:
    entry = _cache.get(market_id)
    if entry is None:
        return None
    stored_at, insight = entry
    if allow_stale or time.monotonic() - stored_at < CACHE_TTL_SECONDS:
        return insight
    return None


def _respond(market_id: uuid.UUID, source: InsightSource, insight: MarketInsight) -> MarketInsightResponse:
    return MarketInsightResponse(
        market_id=market_id,
        generated_at=datetime.now(timezone.utc),
        source=source,
        insight=insight,
    )


def get_insight_with_fallback(market, trades: Sequence) -> MarketInsightResponse:
    """Insight for a market that always returns something displayable."""
    cached = _cache_get(market.id, allow_stale=False)
    if cached is not None:
        return _respond(market.id, "cached", cached)

    if len(trades) < MIN_TRADES_FOR_GENERATION:
        return _respond(market.id, "fallback", _too_few_trades_insight(len(trades)))

    if not get_settings().gemini_api_key:
        logger.info("insight: GEMINI_API_KEY not set, serving fallback")
        stale = _cache_get(market.id, allow_stale=True)
        if stale is not None:
            return _respond(market.id, "cached", stale)
        return _respond(market.id, "fallback", STATIC_FALLBACK)

    try:
        insight = generate_insight(market, trades)
    except Exception:
        logger.exception("insight: generation failed for market %s", market.id)
        stale = _cache_get(market.id, allow_stale=True)
        if stale is not None:
            return _respond(market.id, "cached", stale)
        return _respond(market.id, "fallback", STATIC_FALLBACK)

    _cache[market.id] = (time.monotonic(), insight)
    return _respond(market.id, "gemini", insight)
