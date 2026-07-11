"""HTTP route tests for markets, trades, positions, and auth guards."""

from backend.models.enums import TradeSide
from backend.services import market_service, trade_service


def test_health_endpoint(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_markets_returns_seeded_markets(db, client) -> None:
    market_service.seed_demo_markets(db)
    response = client.get("/markets")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == len(market_service.DEMO_MARKETS)
    assert payload[0]["yes_price_bps"] == 5000


def test_get_market_detail_404_for_unknown(client) -> None:
    response = client.get("/markets/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404
    assert response.json()["detail"] == "Market not found"


def test_post_trades_requires_auth(client, db, market, wallet) -> None:
    response = client.post(
        "/trades",
        json={
            "market_id": str(market.id),
            "side": TradeSide.yes.value,
            "amount": 100,
        },
    )
    assert response.status_code == 401


def test_post_trades_executes_with_auth(
    client, db, market, wallet, auth_headers
) -> None:
    starting_balance = wallet.balance_credits
    response = client.post(
        "/trades",
        headers=auth_headers,
        json={
            "market_id": str(market.id),
            "side": TradeSide.yes.value,
            "amount": 500,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["cost"] == 500
    assert body["shares"] > 0
    assert body["balance_after"] == starting_balance - body["cost"]


def test_market_trades_feed_lists_recent_trades(
    client, db, user, wallet, market, auth_headers
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.yes,
        amount=100,
    )

    response = client.get(f"/markets/{market.id}/trades")
    assert response.status_code == 200
    trades = response.json()
    assert len(trades) == 1
    assert trades[0]["side"] == TradeSide.yes.value


def test_price_history_returns_trade_points(
    client, db, user, wallet, market, auth_headers
) -> None:
    trade_service.execute_trade(
        db,
        user_id=user.id,
        market_id=market.id,
        side=TradeSide.no,
        amount=200,
    )

    response = client.get(f"/markets/{market.id}/price-history")
    assert response.status_code == 200
    points = response.json()
    assert len(points) == 1
    assert "yes_price_bps" in points[0]


def test_positions_and_wallet_endpoints_require_auth(client, market) -> None:
    assert client.get("/positions").status_code == 401
    assert client.get(f"/markets/{market.id}/position").status_code == 401
    assert client.get("/me/wallet").status_code == 401


def test_wallet_endpoint_returns_balance(client, wallet, auth_headers) -> None:
    response = client.get("/me/wallet", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["balance_credits"] == wallet.balance_credits


def test_positions_endpoint_after_trade(
    client, db, market, wallet, auth_headers
) -> None:
    client.post(
        "/trades",
        headers=auth_headers,
        json={
            "market_id": str(market.id),
            "side": TradeSide.yes.value,
            "amount": 300,
        },
    )

    response = client.get("/positions", headers=auth_headers)
    assert response.status_code == 200
    positions = response.json()
    assert len(positions) == 1
    assert positions[0]["yes_shares"] > 0
    assert positions[0]["market_title"] == market.title
    assert positions[0]["market_status"] == market.status.value
