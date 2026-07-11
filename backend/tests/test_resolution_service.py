"""Tests for market resolution and payouts."""

from sqlalchemy.orm import Session

from backend.models.enums import MarketOutcome, TradeSide
from backend.models.position import Position
from backend.models.wallet import Wallet
from backend.services import resolution_service, trade_service


def test_resolve_market_pays_winning_yes_shares(
    db: Session, user, wallet, market, admin_user
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=1_000,
    )

    balance_before = wallet.balance_credits
    position = db.query(Position).filter_by(user_id=user.id, market_id=market.id).one()
    yes_shares = position.yes_shares

    result = resolution_service.resolve_market(
        db,
        market_id=market.id,
        outcome=MarketOutcome.yes,
        resolved_by=admin_user.id,
        evidence="Demo resolution",
    )

    db.refresh(wallet)
    db.refresh(position)
    db.refresh(market)

    assert result.positions_settled == 1
    assert result.total_payout_credits == yes_shares
    assert wallet.balance_credits == balance_before + yes_shares
    assert position.realized_pnl == yes_shares - position.cost_basis_credits
    assert market.status.value == "resolved"
    assert market.resolution_outcome == MarketOutcome.yes


def test_resolve_market_pays_winning_no_shares(
    db: Session, user, wallet, market, admin_user
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.no,
        amount=1_000,
    )

    balance_before = wallet.balance_credits
    position = db.query(Position).filter_by(user_id=user.id, market_id=market.id).one()
    no_shares = position.no_shares

    resolution_service.resolve_market(
        db,
        market_id=market.id,
        outcome=MarketOutcome.no,
        resolved_by=admin_user.id,
    )

    db.refresh(wallet)
    db.refresh(position)

    assert wallet.balance_credits == balance_before + no_shares
    assert position.realized_pnl == no_shares - position.cost_basis_credits


def test_resolve_market_rejects_double_resolution(
    db: Session, market, admin_user
) -> None:
    resolution_service.resolve_market(
        db,
        market_id=market.id,
        outcome=MarketOutcome.yes,
        resolved_by=admin_user.id,
    )

    try:
        resolution_service.resolve_market(
            db,
            market_id=market.id,
            outcome=MarketOutcome.no,
            resolved_by=admin_user.id,
        )
        raise AssertionError("Expected ResolutionError")
    except resolution_service.ResolutionError as exc:
        assert exc.status_code == 409
