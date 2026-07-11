"""Quality checks for price-history data that feeds the Recharts price chart.

These tests evaluate whether the market/trade/bot implementation produces
chart-ready series: chronological, in-range, moving under simulation, and
aligned between /price-history and /trades feeds.
"""

from __future__ import annotations

from backend.bots.bot_runner import BotRunner
from backend.bots.scripted_sequence import (
    convergence_toward_yes_sequence,
    replay_scripted_sequence,
)
from backend.models.enums import TradeSide
from backend.services import amm, market_service, trade_service


def _assert_chart_ready_points(points: list[dict]) -> None:
    assert points, "chart needs at least one price point"
    for point in points:
        assert "trade_id" in point
        assert "yes_price_bps" in point
        assert "created_at" in point
        bps = point["yes_price_bps"]
        assert isinstance(bps, int)
        assert 0 <= bps <= 10_000

    trade_ids = [p["trade_id"] for p in points]
    assert trade_ids == sorted(trade_ids), "price history must be chronological by trade_id"


def test_price_history_after_user_trade_is_chart_ready(
    client, db, user, wallet, market
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=400,
    )

    response = client.get(f"/markets/{market.id}/price-history")
    assert response.status_code == 200
    points = response.json()
    _assert_chart_ready_points(points)
    assert len(points) == 1


def test_price_history_grows_with_multiple_trades(
    client, db, user, wallet, market
) -> None:
    for amount, side in ((100, TradeSide.yes), (150, TradeSide.no), (200, TradeSide.yes)):
        trade_service.execute_trade(
            db,
            user_id=user.id,
            market_id=market.id,
            side=side,
            amount=amount,
        )

    points = client.get(f"/markets/{market.id}/price-history").json()
    _assert_chart_ready_points(points)
    assert len(points) == 3

    # Series should actually move — not a flat line of identical snapshots.
    prices = {p["yes_price_bps"] for p in points}
    assert len(prices) >= 2


def test_belief_burst_produces_chartable_price_series(client, db, market) -> None:
    start = amm.get_yes_price_bps(market.pool_yes, market.pool_no)
    assert market.p_true_bps == 7200
    assert start == 5000

    runner = BotRunner()
    executed = runner.run_belief_burst(
        db,
        market_id=market.id,
        trade_count=25,
        rng_seed=11,
    )
    assert executed >= 5, "belief bots should trade often enough to draw a chart"

    points = client.get(f"/markets/{market.id}/price-history").json()
    _assert_chart_ready_points(points)
    assert len(points) == executed

    db.refresh(market)
    end = amm.get_yes_price_bps(market.pool_yes, market.pool_no)
    assert end > start, "football market (p_true 72%) should lift YES price"
    assert points[-1]["yes_price_bps"] == end


def test_scripted_burst_via_admin_api_feeds_chart(
    client, db, market, admin_auth_headers
) -> None:
    response = client.post(
        "/admin/simulate/burst",
        headers=admin_auth_headers,
        json={
            "market_id": str(market.id),
            "trade_count": 8,
            "mode": "scripted",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["trades_executed"] == 8

    points = client.get(f"/markets/{market.id}/price-history").json()
    _assert_chart_ready_points(points)
    assert len(points) == 8
    assert points[-1]["yes_price_bps"] == body["yes_price_bps"]
    assert body["yes_price_bps"] > 5000


def test_price_history_matches_trade_feed_snapshots(
    client, db, user, wallet, market
) -> None:
    steps = convergence_toward_yes_sequence(6)
    replay_scripted_sequence(db, market_id=market.id, steps=steps)

    history = client.get(f"/markets/{market.id}/price-history").json()
    trades = client.get(f"/markets/{market.id}/trades").json()

    _assert_chart_ready_points(history)
    assert len(history) == len(trades)

    # Trade feed is newest-first; history is chronological.
    feed_by_id = {t["id"]: t for t in trades}
    for point in history:
        trade = feed_by_id[point["trade_id"]]
        assert trade["yes_price_bps"] == point["yes_price_bps"]


def test_bot_and_user_trades_interleave_on_chart(
    client, db, user, wallet, market
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=250,
    )
    trade_service.execute_bot_trade(
        db,
        market_id=market.id,
        side=TradeSide.no,
        amount=180,
        bot_label="belief",
    )
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=120,
    )

    points = client.get(f"/markets/{market.id}/price-history").json()
    trades = client.get(f"/markets/{market.id}/trades").json()
    _assert_chart_ready_points(points)
    assert len(points) == 3

    bot_rows = [t for t in trades if t["is_bot"]]
    human_rows = [t for t in trades if not t["is_bot"]]
    assert len(bot_rows) == 1
    assert len(human_rows) == 2


def test_empty_market_price_history_is_empty_list(client, market) -> None:
    response = client.get(f"/markets/{market.id}/price-history")
    assert response.status_code == 200
    assert response.json() == []


def test_seeded_demo_markets_open_at_midpoint_for_charts(db, client) -> None:
    market_service.seed_demo_markets(db)
    markets = client.get("/markets").json()
    assert len(markets) == 3
    for row in markets:
        assert row["yes_price_bps"] == 5000
        assert row["status"] == "trading"
