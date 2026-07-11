"""Tests for bot trade execution, orchestration, and admin simulate routes."""

import asyncio

import pytest
from sqlalchemy import select

from backend.bots.bot_runner import BotRunner
from backend.bots.scripted_sequence import (
    convergence_toward_yes_sequence,
    replay_scripted_sequence,
)
from backend.models.enums import TradeSide
from backend.models.position import Position
from backend.models.trade import Trade
from backend.services import amm, market_service, trade_service


def test_execute_bot_trade_updates_pools_and_records_bot_row(db, market) -> None:
    starting_yes = market.pool_yes
    starting_no = market.pool_no

    result = trade_service.execute_bot_trade(
        db,
        market_id=market.id,
        side=TradeSide.yes,
        amount=500,
        bot_label="belief",
    )

    db.refresh(market)
    trade = db.get(Trade, result.trade_id)

    assert result.cost == 500
    assert result.shares > 0
    assert market.pool_yes != starting_yes or market.pool_no != starting_no
    assert trade is not None
    assert trade.is_bot is True
    assert trade.user_id is None
    assert trade.bot_label == "belief"


def test_execute_bot_trade_does_not_touch_wallets_or_positions(
    db, user, wallet, market
) -> None:
    starting_balance = wallet.balance_credits

    trade_service.execute_bot_trade(
        db,
        market_id=market.id,
        side=TradeSide.yes,
        amount=300,
    )

    db.refresh(wallet)
    positions = db.execute(
        select(Position).where(Position.user_id == user.id)
    ).scalars().all()

    assert wallet.balance_credits == starting_balance
    assert positions == []


def test_run_belief_burst_moves_price_toward_p_true(db, market) -> None:
    # Football replay market seeds at 50% with p_true 72%.
    assert market.p_true_bps == 7200
    start_price = amm.get_yes_price_bps(market.pool_yes, market.pool_no)

    runner = BotRunner()
    executed = runner.run_belief_burst(
        db,
        market_id=market.id,
        trade_count=30,
        rng_seed=42,
    )

    db.refresh(market)
    end_price = amm.get_yes_price_bps(market.pool_yes, market.pool_no)

    assert executed > 0
    assert end_price > start_price


def test_scripted_sequence_is_deterministic(db, market) -> None:
    steps = convergence_toward_yes_sequence(8)

    replay_scripted_sequence(db, market_id=market.id, steps=steps, bot_label="scripted")
    price_after_first = amm.get_yes_price_bps(market.pool_yes, market.pool_no)

    market.pool_yes = market_service.INITIAL_POOL
    market.pool_no = market_service.INITIAL_POOL
    db.commit()

    replay_scripted_sequence(db, market_id=market.id, steps=steps, bot_label="scripted")
    price_after_second = amm.get_yes_price_bps(market.pool_yes, market.pool_no)

    assert price_after_first == price_after_second


def test_admin_simulate_burst_requires_admin(client, market, auth_headers) -> None:
    response = client.post(
        "/admin/simulate/burst",
        headers=auth_headers,
        json={"market_id": str(market.id), "trade_count": 5, "mode": "scripted"},
    )
    assert response.status_code == 403


def test_admin_simulate_burst_executes_trades(
    client, db, market, admin_auth_headers
) -> None:
    response = client.post(
        "/admin/simulate/burst",
        headers=admin_auth_headers,
        json={
            "market_id": str(market.id),
            "trade_count": 6,
            "mode": "scripted",
            "rng_seed": 1,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["trades_executed"] == 6
    assert body["yes_price_bps"] != 5000

    trades = db.execute(select(Trade).where(Trade.market_id == market.id)).scalars().all()
    assert len(trades) == 6
    assert all(t.is_bot for t in trades)


def test_start_and_stop_background_simulation(market) -> None:
    async def _run() -> None:
        runner = BotRunner()
        status = await runner.start_belief_simulation(market.id, rng_seed=7)
        assert status.running is True

        await asyncio.sleep(0.1)

        stopped = await runner.stop_simulation(market.id)
        assert stopped is not None
        assert stopped.running is False

    asyncio.run(_run())
