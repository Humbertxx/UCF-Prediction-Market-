"""Tests for wallet grant helpers."""

from sqlalchemy.orm import Session

from backend.auth.user import User
from backend.config import get_settings
from backend.services.wallet_service import ensure_wallet, grant_wallets_for_all_users


def test_ensure_wallet_creates_wallet_with_starting_grant(
    db: Session, user: User
) -> None:
    settings = get_settings()
    wallet = ensure_wallet(db, user.id)
    db.commit()

    assert wallet.user_id == user.id
    assert wallet.balance_credits == settings.starting_wallet_credits
    assert wallet.initial_grant == settings.starting_wallet_credits


def test_ensure_wallet_is_idempotent(db: Session, user: User) -> None:
    first = ensure_wallet(db, user.id)
    db.commit()
    second = ensure_wallet(db, user.id)

    assert first.user_id == second.user_id
    assert first.balance_credits == second.balance_credits


def test_grant_wallets_for_all_users_only_creates_missing(
    db: Session, user: User
) -> None:
    other = User(google_id="google-other-001", email="other@example.com", name="Other")
    db.add(other)
    db.commit()

    created = grant_wallets_for_all_users(db)
    assert created == 2

    created_again = grant_wallets_for_all_users(db)
    assert created_again == 0
