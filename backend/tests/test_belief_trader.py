"""Unit tests for belief-driven bot strategy."""

import random
import uuid
from types import SimpleNamespace

from backend.bots.belief_trader import (
    BeliefTraderConfig,
    conviction_trade_size,
    decide_trade,
    sample_belief_bps,
)
from backend.models.enums import MarketStatus, TradeSide
from backend.services import amm


def make_market(**overrides):
    defaults = {
        "id": uuid.uuid4(),
        "status": MarketStatus.trading,
        "pool_yes": 100_000,
        "pool_no": 100_000,
        "p_true_bps": 7200,
    }
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def test_sample_belief_stays_near_p_true():
    rng = random.Random(42)
    samples = [
        sample_belief_bps(6000, sigma_bps=300, rng=rng) for _ in range(200)
    ]
    avg = sum(samples) / len(samples)
    assert 5500 < avg < 6500


def test_decide_buys_yes_when_belief_above_market():
    market = make_market(p_true_bps=8000)  # hidden truth high
    rng = random.Random(1)
    intent = decide_trade(
        market,
        rng=rng,
        config=BeliefTraderConfig(sigma_bps=50, min_edge_bps=10),
    )
    assert intent is not None
    assert intent.side == TradeSide.yes
    assert intent.amount_credits >= 50


def test_decide_buys_no_when_belief_below_market():
    market = make_market(p_true_bps=2000)  # hidden truth low
    rng = random.Random(2)
    intent = decide_trade(
        market,
        rng=rng,
        config=BeliefTraderConfig(sigma_bps=50, min_edge_bps=10),
    )
    assert intent is not None
    assert intent.side == TradeSide.no


def test_decide_skips_when_edge_too_small():
    market = make_market()
    # Force belief == market price by using zero sigma and matching pools.
    price = amm.get_yes_price_bps(market.pool_yes, market.pool_no)
    rng = random.Random(0)

    intent = decide_trade(
        make_market(p_true_bps=price),
        rng=rng,
        config=BeliefTraderConfig(sigma_bps=0, min_edge_bps=500),
    )
    assert intent is None


def test_decide_skips_non_trading_market():
    market = make_market(status=MarketStatus.seeded)
    intent = decide_trade(market, rng=random.Random(0))
    assert intent is None


def test_conviction_trade_size_respects_bounds():
    tiny = conviction_trade_size(0, min_trade_credits=50, max_trade_credits=500)
    small = conviction_trade_size(100, min_trade_credits=50, max_trade_credits=500)
    large = conviction_trade_size(5000, min_trade_credits=50, max_trade_credits=500)
    assert tiny == 50
    assert 50 <= small < large
    assert large == 500
