"""Market service layer.

Read helpers for markets and price history, plus idempotent seeding of the
demo markets. Route handlers stay thin by delegating here.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.enums import MarketStatus
from backend.models.market import Market
from backend.models.trade import Trade
from backend.services import amm

# Symmetric starting liquidity => YES price opens at 0.50 (5000 bps).
INITIAL_POOL = 100_000


@dataclass(frozen=True)
class DemoMarketSpec:
    slug: str
    title: str
    description: str
    p_true_bps: int


DEMO_MARKETS: tuple[DemoMarketSpec, ...] = (
    DemoMarketSpec(
        slug="ucf-football-historical-replay",
        title="UCF football historical replay: does UCF win?",
        description="Resolves via the ESPN box score for the replayed game.",
        p_true_bps=7200,
    ),
    DemoMarketSpec(
        slug="cop3502-exam1-mean-at-least-80",
        title="COP3502 Exam 1 mean >= 80",
        description="Resolves via the instructor's posted class mean on Canvas.",
        p_true_bps=4500,
    ),
    DemoMarketSpec(
        slug="ucf-fall-2026-enrollment-over-75000",
        title="UCF Fall 2026 enrollment > 75,000",
        description="Resolves via the official enrollment figure. Left open for the demo.",
        p_true_bps=6000,
    ),
    # Extra proof-of-concept markets so the list feels populated in demos.
    DemoMarketSpec(
        slug="ucf-vs-usf-football-ucf-covers",
        title="UCF covers the spread vs USF?",
        description="Demo sports market. Resolves via the official box score and published line.",
        p_true_bps=5800,
    ),
    DemoMarketSpec(
        slug="ucf-hackathon-2026-over-400-hackers",
        title="UCF Hackathon 2026 draws 400+ hackers",
        description="Demo campus-events market. Resolves via the event organizer's final headcount.",
        p_true_bps=5200,
    ),
    DemoMarketSpec(
        slug="ucf-dining-meal-plan-price-flat-fall-2026",
        title="UCF meal-plan base price stays flat for Fall 2026",
        description="Demo campus-life market. Resolves via Housing & Residence Life published rates.",
        p_true_bps=3800,
    ),
)

# Demo category labels for portfolio P/L breakdown (keyed by market slug).
CATEGORY_BY_SLUG: dict[str, str] = {
    "ucf-football-historical-replay": "Sports",
    "cop3502-exam1-mean-at-least-80": "Academics",
    "ucf-fall-2026-enrollment-over-75000": "Campus",
    "ucf-vs-usf-football-ucf-covers": "Sports",
    "ucf-hackathon-2026-over-400-hackers": "Campus",
    "ucf-dining-meal-plan-price-flat-fall-2026": "Campus",
}


def infer_market_category(slug: str) -> str:
    return CATEGORY_BY_SLUG.get(slug, "General")


def list_markets(db: Session) -> list[Market]:
    return list(db.execute(select(Market).order_by(Market.created_at)).scalars())


def get_market(db: Session, market_id) -> Market | None:
    return db.get(Market, market_id)


def get_market_by_slug(db: Session, slug: str) -> Market | None:
    return db.execute(select(Market).where(Market.slug == slug)).scalar_one_or_none()


def get_price_history(db: Session, market_id) -> list[Trade]:
    """Ordered post-trade price snapshots that back the market chart."""
    return list(
        db.execute(
            select(Trade).where(Trade.market_id == market_id).order_by(Trade.id)
        ).scalars()
    )


def yes_price_bps(market: Market) -> int:
    return amm.get_yes_price_bps(market.pool_yes, market.pool_no)


def seed_demo_markets(db: Session) -> list[Market]:
    """Create the demo markets if missing. Idempotent (keyed by slug)."""
    created: list[Market] = []
    for spec in DEMO_MARKETS:
        existing = get_market_by_slug(db, spec.slug)
        if existing is not None:
            continue
        market = Market(
            slug=spec.slug,
            title=spec.title,
            description=spec.description,
            status=MarketStatus.trading,
            pool_yes=INITIAL_POOL,
            pool_no=INITIAL_POOL,
            k_constant=INITIAL_POOL * INITIAL_POOL,
            p_true_bps=spec.p_true_bps,
        )
        db.add(market)
        created.append(market)
    if created:
        db.commit()
        for market in created:
            db.refresh(market)
    return created
