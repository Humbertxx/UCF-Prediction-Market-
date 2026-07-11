"""Wallet helpers for reads and idempotent demo grants."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth.user import User
from backend.config import get_settings
from backend.models.wallet import Wallet


def ensure_wallet(db: Session, user_id: uuid.UUID) -> Wallet:
    """Return the user's wallet, creating one with the starting grant if missing."""
    wallet = db.get(Wallet, user_id)
    if wallet is not None:
        return wallet

    settings = get_settings()
    wallet = Wallet(
        user_id=user_id,
        balance_credits=settings.starting_wallet_credits,
        initial_grant=settings.starting_wallet_credits,
    )
    db.add(wallet)
    db.flush()
    return wallet


def grant_wallets_for_all_users(db: Session) -> int:
    """Create wallets for every user that does not have one. Returns count created."""
    user_ids = db.execute(select(User.id)).scalars().all()
    created = 0
    for user_id in user_ids:
        if db.get(Wallet, user_id) is None:
            ensure_wallet(db, user_id)
            created += 1
    if created:
        db.commit()
    return created
