"""Admin resolve route tests."""

from backend.models.enums import TradeSide


def test_admin_resolve_requires_admin(client, market, auth_headers) -> None:
    response = client.post(
        f"/admin/markets/{market.id}/resolve",
        headers=auth_headers,
        json={"outcome": "yes"},
    )
    assert response.status_code == 403


def test_admin_resolve_pays_positions(
    client, db, market, wallet, auth_headers, admin_auth_headers
) -> None:
    client.post(
        "/trades",
        headers=auth_headers,
        json={
            "market_id": str(market.id),
            "side": TradeSide.yes.value,
            "amount": 500,
        },
    )

    balance_before = wallet.balance_credits

    response = client.post(
        f"/admin/markets/{market.id}/resolve",
        headers=admin_auth_headers,
        json={"outcome": "yes", "evidence": "Official result"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["outcome"] == "yes"
    assert body["positions_settled"] == 1
    assert body["total_payout_credits"] > 0

    db.refresh(wallet)
    db.refresh(market)
    assert wallet.balance_credits > balance_before
    assert market.status.value == "resolved"
