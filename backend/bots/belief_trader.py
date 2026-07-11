"""Belief-based trading strategy for demo bots.

Each bot draws a private belief around the market's hidden ``p_true_bps``,
compares it to the current CPMM YES price, and emits a bounded buy intent when
conviction is strong enough. Strategy only — execution belongs in
``bot_runner`` + ``trade_service.execute_bot_trade``.
"""

from __future__ import annotations

import random
import uuid
from dataclasses import dataclass
from typing import Optional, Protocol

from backend.models.enums import MarketStatus, TradeSide
from backend.services import amm

BPS_DENOMINATOR = amm.BPS_DENOMINATOR


class MarketLike(Protocol):
    """Minimal market surface the strategy needs (ORM model or test stub)."""

    id: uuid.UUID
    status: MarketStatus
    pool_yes: int
    pool_no: int
    p_true_bps: int


@dataclass(frozen=True)
class BeliefTraderConfig:
    """Tunable strategy parameters for demo-safe convergence."""

    # Std dev of belief draw around p_true, in basis points.
    sigma_bps: int = 400
    # Ignore tiny mispricings to avoid noise trades at the midpoint.
    min_edge_bps: int = 75
    min_trade_credits: int = 50
    max_trade_credits: int = 750
    # Clamp sampled beliefs away from 0/100% for numerical stability.
    min_belief_bps: int = 200
    max_belief_bps: int = 9800


@dataclass(frozen=True)
class TradeIntent:
    """Explainable bot action for logging and execution."""

    market_id: uuid.UUID
    side: TradeSide
    amount_credits: int
    belief_bps: int
    market_yes_price_bps: int
    edge_bps: int
    reason: str


def sample_belief_bps(
    p_true_bps: int,
    *,
    sigma_bps: int,
    rng: random.Random,
    min_belief_bps: int = 200,
    max_belief_bps: int = 9800,
) -> int:
    """Draw private belief ~ Normal(p_true, sigma) in basis points."""
    raw = rng.gauss(p_true_bps, sigma_bps)
    return int(max(min_belief_bps, min(max_belief_bps, round(raw))))


def conviction_trade_size(
    edge_bps: int,
    *,
    min_trade_credits: int,
    max_trade_credits: int,
) -> int:
    """Map pricing edge to an integer credit spend in [min, max]."""
    edge = abs(edge_bps)
    # Scale linearly up to a 2500 bps edge (25 points), then cap.
    scale = min(edge / 2500, 1.0)
    span = max_trade_credits - min_trade_credits
    return min_trade_credits + int(scale * span)


def decide_trade(
    market: MarketLike,
    *,
    rng: random.Random,
    config: BeliefTraderConfig | None = None,
) -> Optional[TradeIntent]:
    """Return a buy intent when belief diverges enough from the CPMM price."""
    cfg = config or BeliefTraderConfig()

    if market.status != MarketStatus.trading:
        return None

    market_yes_price_bps = amm.get_yes_price_bps(market.pool_yes, market.pool_no)
    belief_bps = sample_belief_bps(
        market.p_true_bps,
        sigma_bps=cfg.sigma_bps,
        rng=rng,
        min_belief_bps=cfg.min_belief_bps,
        max_belief_bps=cfg.max_belief_bps,
    )
    edge_bps = belief_bps - market_yes_price_bps

    if abs(edge_bps) < cfg.min_edge_bps:
        return None

    side = TradeSide.yes if edge_bps > 0 else TradeSide.no
    amount = conviction_trade_size(
        edge_bps,
        min_trade_credits=cfg.min_trade_credits,
        max_trade_credits=cfg.max_trade_credits,
    )

    direction = "YES" if side == TradeSide.yes else "NO"
    reason = (
        f"belief {belief_bps / 100:.1f}% vs market {market_yes_price_bps / 100:.1f}% "
        f"-> buy {direction} ({amount} credits)"
    )

    return TradeIntent(
        market_id=market.id,
        side=side,
        amount_credits=amount,
        belief_bps=belief_bps,
        market_yes_price_bps=market_yes_price_bps,
        edge_bps=edge_bps,
        reason=reason,
    )


class BeliefTrader:
    """Stateful wrapper so ``bot_runner`` can attach a label and config."""

    def __init__(
        self,
        *,
        bot_label: str = "belief",
        config: BeliefTraderConfig | None = None,
        rng: random.Random | None = None,
    ) -> None:
        self.bot_label = bot_label
        self.config = config or BeliefTraderConfig()
        self.rng = rng or random.Random()

    def decide(self, market: MarketLike) -> Optional[TradeIntent]:
        return decide_trade(market, rng=self.rng, config=self.config)
