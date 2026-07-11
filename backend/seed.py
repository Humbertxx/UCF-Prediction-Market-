"""Rerunnable demo seed script.

Creates the demo markets (idempotent by slug) and grants wallets to any
user that does not already have one.

Usage (from repo root):
    python -m backend.seed                # seed markets + wallets (idempotent)
    python -m backend.seed --reset-demo   # DESTRUCTIVE: reset demo markets to a
                                          # fresh 50/50 state for a demo run

``--reset-demo`` deletes all trades and positions on the demo markets, resets
their pools/resolution so prices open at 0.50, and restores every wallet to its
initial grant. Users and login sessions are kept. Dev/demo databases only.
"""

import argparse

from sqlalchemy import delete, select

from backend.database import Base, SessionLocal, engine
from backend.models.enums import MarketStatus
from backend.models.position import Position
from backend.models.trade import Trade
from backend.models.wallet import Wallet
from backend.services import market_service
from backend.services.wallet_service import grant_wallets_for_all_users

import backend.models  # noqa: F401


def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        markets = market_service.seed_demo_markets(db)
        wallets_created = grant_wallets_for_all_users(db)
        print(
            f"Seed complete: {len(markets)} market(s) created, "
            f"{wallets_created} wallet(s) granted."
        )
    finally:
        db.close()


def run_reset_demo() -> None:
    """Reset demo markets to their freshly-seeded state (see module docstring)."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        market_service.seed_demo_markets(db)
        slugs = [spec.slug for spec in market_service.DEMO_MARKETS]
        markets = [
            market
            for market in (market_service.get_market_by_slug(db, slug) for slug in slugs)
            if market is not None
        ]
        market_ids = [market.id for market in markets]

        trades_deleted = db.execute(
            delete(Trade).where(Trade.market_id.in_(market_ids))
        ).rowcount
        positions_deleted = db.execute(
            delete(Position).where(Position.market_id.in_(market_ids))
        ).rowcount

        for market in markets:
            market.pool_yes = market_service.INITIAL_POOL
            market.pool_no = market_service.INITIAL_POOL
            market.k_constant = market_service.INITIAL_POOL**2
            market.status = MarketStatus.trading
            market.resolution_outcome = None
            market.resolved_at = None
            market.resolved_by = None
            market.resolution_evidence = None

        wallets_reset = 0
        for wallet in db.execute(select(Wallet)).scalars():
            if wallet.balance_credits != wallet.initial_grant:
                wallet.balance_credits = wallet.initial_grant
                wallets_reset += 1

        db.commit()
        print(
            f"Demo reset: {len(markets)} market(s) back to 0.50, "
            f"{trades_deleted} trade(s) and {positions_deleted} position(s) deleted, "
            f"{wallets_reset} wallet(s) restored to initial grant."
        )
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reset-demo",
        action="store_true",
        help="DESTRUCTIVE: wipe demo-market trades/positions and reset prices to 0.50",
    )
    args = parser.parse_args()
    if args.reset_demo:
        run_reset_demo()
    else:
        run_seed()
