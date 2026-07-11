"""Trade history route tests."""

from backend.models.enums import TradeSide


def test_my_trades_requires_auth(client, market) -> None:
    assert client.get("/users/me/trades").status_code == 401


def test_my_trades_after_trade(client, market, wallet, auth_headers) -> None:
    client.post(
        "/trades",
        headers=auth_headers,
        json={
            "market_id": str(market.id),
            "side": TradeSide.yes.value,
            "amount": 400,
        },
    )

    response = client.get("/users/me/trades", headers=auth_headers)
    assert response.status_code == 200
    trades = response.json()
    assert len(trades) == 1
    assert trades[0]["market_title"] == market.title
    assert trades[0]["cost_credits"] == 400


def test_market_trades_404_for_unknown_market(client) -> None:
    import uuid

    response = client.get(f"/markets/{uuid.uuid4()}/trades")
    assert response.status_code == 404
