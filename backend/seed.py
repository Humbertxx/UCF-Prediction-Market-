"""Rerunnable demo seed script.

Creates the three demo markets (idempotent by slug) and grants wallets to any
user that does not already have one.

Usage (from bloomknights/):
    python -m backend.seed
"""

from backend.database import Base, SessionLocal, engine
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


if __name__ == "__main__":
    run_seed()
