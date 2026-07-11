"""Tests for user profile stats aggregation."""

import uuid

from sqlalchemy.orm import Session

from backend.models.enums import TradeSide
from backend.services import trade_service, user_stats_service


def test_profile_stats_zero_for_new_user(db: Session, user) -> None:
    profile = user_stats_service.get_user_profile_stats(db, user.id)

    assert profile.username == "Trader"
    assert profile.total_volume_credits == 0
    assert profile.total_pnl_credits == 0
    assert profile.category_pnl == []
    assert profile.email == user.email


def test_profile_stats_after_trade(db: Session, user, wallet, market) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=500,
    )

    profile = user_stats_service.get_user_profile_stats(db, user.id)

    assert profile.total_volume_credits == 500
    assert len(profile.category_pnl) == 1
    assert profile.category_pnl[0].category == "Sports"
    assert profile.total_pnl_credits == profile.category_pnl[0].pnl_credits


def test_username_falls_back_to_email_local_part(db: Session) -> None:
    from backend.auth.user import User

    user = User(
        google_id="google-no-name",
        email="judge@example.com",
        name=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = user_stats_service.get_user_profile_stats(db, user.id)
    assert profile.username == "judge"


def test_profile_stats_user_not_found(db: Session) -> None:
    import pytest

    with pytest.raises(user_stats_service.ServiceError) as exc:
        user_stats_service.get_user_profile_stats(db, uuid.uuid4())
    assert exc.value.status_code == 404
