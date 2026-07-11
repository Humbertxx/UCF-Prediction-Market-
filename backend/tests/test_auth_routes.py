"""HTTP tests for demo auth login."""

import uuid

from backend.auth.dependencies import is_admin_user
from backend.auth.user import User
from backend.config import get_settings
from backend.services import auth_service


def test_demo_login_creates_user_and_returns_jwt(client, db) -> None:
    response = client.post(
        "/auth/demo",
        json={"email": "NewTrader@Example.com", "name": "New Trader"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["email"] == "newtrader@example.com"
    assert body["name"] == "New Trader"
    assert body["is_admin"] is False
    assert body["access_token"]

    user = db.get(User, uuid.UUID(body["user_id"]))
    assert user is not None
    assert user.email == "newtrader@example.com"
    assert user.google_id.startswith("demo-")


def test_demo_login_is_idempotent(client, db) -> None:
    first = client.post("/auth/demo", json={"email": "same@example.com"}).json()
    second = client.post("/auth/demo", json={"email": "same@example.com"}).json()
    assert first["user_id"] == second["user_id"]


def test_demo_login_admin_flag_from_allowlist(client) -> None:
    admin_email = next(iter(get_settings().admin_email_set))
    response = client.post("/auth/demo", json={"email": admin_email})
    assert response.status_code == 200
    assert response.json()["is_admin"] is True


def test_auth_me_requires_token(client) -> None:
    assert client.get("/auth/me").status_code == 401


def test_auth_me_with_token(client, user, auth_headers) -> None:
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == user.email
    assert body["user_id"] == str(user.id)


def test_create_access_token_round_trips(user) -> None:
    from backend.auth.dependencies import decode_token

    token = auth_service.create_access_token(user_id=user.id)
    decoded = decode_token(token)
    assert decoded["sub"] == str(user.id)


def test_is_admin_user(user, admin_user) -> None:
    assert is_admin_user(user) is False
    assert is_admin_user(admin_user) is True
