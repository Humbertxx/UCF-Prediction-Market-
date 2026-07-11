"""Tests for Google ID-token → app JWT auth path."""

from unittest.mock import patch

from sqlalchemy import select

from backend.auth.user import User
from backend.services.auth_service import GoogleIdentity


def test_google_login_creates_user_and_returns_jwt(client, db) -> None:
    identity = GoogleIdentity(
        google_id="google-sub-123",
        email="google.user@example.com",
        name="Google User",
        profile_picture="https://example.com/pic.png",
    )
    with patch(
        "backend.services.auth_service.verify_google_id_token",
        return_value=identity,
    ):
        response = client.post("/auth/google", json={"id_token": "fake-id-token"})

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "google.user@example.com"
    assert body["name"] == "Google User"
    assert body["access_token"]
    assert body["token_type"] == "bearer"

    user = db.execute(
        select(User).where(User.email == "google.user@example.com")
    ).scalar_one()
    assert user.google_id == "google-sub-123"
    assert user.profile_picture == "https://example.com/pic.png"


def test_google_login_links_existing_demo_email(client, db, user) -> None:
    """Same email as a demo user upgrades google_id to the real Google sub."""
    identity = GoogleIdentity(
        google_id="google-sub-link",
        email=user.email,
        name="Linked",
        profile_picture=None,
    )
    with patch(
        "backend.services.auth_service.verify_google_id_token",
        return_value=identity,
    ):
        response = client.post("/auth/google", json={"id_token": "fake"})

    assert response.status_code == 200
    assert response.json()["user_id"] == str(user.id)
    db.refresh(user)
    assert user.google_id == "google-sub-link"


def test_google_login_rejects_auth_error(client) -> None:
    from backend.services.auth_service import AuthError

    with patch(
        "backend.services.auth_service.verify_google_id_token",
        side_effect=AuthError("Invalid Google id_token", status_code=401),
    ):
        response = client.post("/auth/google", json={"id_token": "bad"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid Google id_token"


def test_google_login_requires_id_token(client) -> None:
    response = client.post("/auth/google", json={})
    assert response.status_code == 422
