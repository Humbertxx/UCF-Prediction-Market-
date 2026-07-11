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

PROMPT_VERSION = "v2"
GEMINI_MODEL = "gemini-3.5-flash"

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


def _trade_series_stats(trades: Sequence) -> dict:
    """Derive simple, checkable facts from the trade list for prompt grounding."""
    if not trades:
        return {
            "trade_count_in_series": 0,
            "first_yes_price_bps": None,
            "last_yes_price_bps": None,
            "yes_price_change_bps": 0,
            "yes_buy_count": 0,
            "no_buy_count": 0,
            "bot_trade_count": 0,
        }

    first_price = trades[0].yes_price_bps
    last_price = trades[-1].yes_price_bps
    yes_buys = sum(
        1 for t in trades if getattr(t.side, "value", t.side) == "yes"
    )
    no_buys = len(trades) - yes_buys
    bot_count = sum(1 for t in trades if t.is_bot)

    return {
        "trade_count_in_series": len(trades),
        "first_yes_price_bps": first_price,
        "last_yes_price_bps": last_price,
        "yes_price_change_bps": last_price - first_price,
        "yes_buy_count": yes_buys,
        "no_buy_count": no_buys,
        "bot_trade_count": bot_count,
    }


def build_prompt(market, trades: Sequence) -> str:
    """Build the versioned insight prompt from demo market data only.

    Sends market title/status/current price, derived series statistics, and a
    compact recent-trade list. Never includes user identifiers, wallet balances,
    or the hidden p_true.
    """
    recent = list(trades)[-MAX_TRADES_IN_PROMPT:]
    current_yes_price_bps = amm.get_yes_price_bps(market.pool_yes, market.pool_no)
    series_stats = _trade_series_stats(recent)

    payload = {
        "market": {
            "title": market.title,
            "status": getattr(market.status, "value", market.status),
            "current_yes_price_bps": current_yes_price_bps,
            "current_yes_price_percent": round(current_yes_price_bps / 100, 1),
        },
        "series_stats": series_stats,
        "trades": [
            {
                "t": trade.created_at.isoformat() if trade.created_at else None,
                "side": getattr(trade.side, "value", trade.side),
                "price_bps": trade.yes_price_bps,
                "price_percent": round(trade.yes_price_bps / 100, 1),
                "credits": trade.cost_credits,
                "bot": bool(trade.is_bot),
            }
            for trade in recent
        ],
    }

    return (
        f"[prompt_version={PROMPT_VERSION}]\n"
        "ROLE\n"
        "You write short commentary for a campus prediction-market simulation. "
        "Traders use virtual credits only. There is no real money and no "
        "guaranteed real-world outcome.\n\n"
        "TASK\n"
        "Read ONLY the JSON market data below and describe what the recent YES "
        "price action suggests. You are summarizing the trade series, not "
        "predicting the real-world event named in the market title.\n\n"
        "DATA DICTIONARY (use these meanings exactly)\n"
        "- current_yes_price_bps / price_bps: YES probability in basis points. "
        "6100 means 61.0%.\n"
        "- side: whether that trade bought YES or NO shares.\n"
        "- credits: virtual credits spent on that trade.\n"
        "- bot: true means a simulated trader, not a human.\n"
        "- series_stats.trade_count_in_series: number of trades you may cite.\n"
        "- series_stats.first_yes_price_bps / last_yes_price_bps: YES price at "
        "the start and end of the provided series.\n"
        "- series_stats.yes_price_change_bps: last minus first YES price in the "
        "series (positive = YES price rose over the series).\n"
        "- series_stats.yes_buy_count / no_buy_count: how many YES vs NO buys "
        "appear in the series.\n\n"
        "STRICT GROUNDING RULES (anti-hallucination)\n"
        "1. Use ONLY facts present in the JSON. Do not invent trades, prices, "
        "timestamps, users, volumes, or outcomes that are not listed.\n"
        "2. Do NOT predict whether the real-world event will happen. Do not say "
        "'UCF will win', 'the exam mean will be above 80', or similar.\n"
        "3. Do NOT mention hidden probabilities, true odds, pools, AMM math, "
        "liquidity, k constants, or any backend mechanics.\n"
        "4. Do NOT mention user identities, emails, wallets, balances, or P/L.\n"
        "5. If the series is short or noisy, say so and lower confidence instead "
        "of guessing.\n"
        "6. Every number you mention (percent, count, direction) must be "
        "derivable from the JSON or series_stats.\n"
        "7. If yes_price_change_bps is near zero, prefer trend='flat' or "
        "trend='mixed', not a strong directional call.\n"
        "8. If YES and NO buys are both common and price moved little, use "
        "trend='mixed'.\n\n"
        "TREND FIELD (YES-price perspective)\n"
        "- bullish_yes: YES price clearly rose over the series "
        "(yes_price_change_bps meaningfully positive).\n"
        "- bearish_yes: YES price clearly fell over the series "
        "(yes_price_change_bps meaningfully negative).\n"
        "- flat: YES price stayed roughly unchanged.\n"
        "- mixed: conflicting signals (e.g. both sides active with choppy price).\n"
        "Never output 'unknown'.\n\n"
        "CONFIDENCE FIELD\n"
        "- high: many trades in series_stats and a clear directional move.\n"
        "- medium: moderate trade count or a visible but not dominant move.\n"
        "- low: few trades, small price change, or choppy/mixed activity.\n\n"
        "OUTPUT FIELD GUIDANCE\n"
        "- summary: 1-2 short sentences. Describe price action only.\n"
        "- key_observation: one concrete, verifiable pattern from the series "
        "(cite counts or bps change when helpful).\n"
        "- Respond with JSON matching the provided schema exactly. No markdown.\n\n"
        f"MARKET DATA (sole source of truth):\n{json.dumps(payload, indent=2)}\n"
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
                    temperature=0.2,
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


def _respond(
    market_id: uuid.UUID, source: InsightSource, insight: MarketInsight
) -> MarketInsightResponse:
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
