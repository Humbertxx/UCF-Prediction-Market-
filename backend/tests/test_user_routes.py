"""HTTP tests for user profile-stats routes."""

import uuid


def test_my_profile_stats_requires_token(client) -> None:
    assert client.get("/users/me/profile-stats").status_code == 401


def test_my_profile_stats_envelope(client, user, auth_headers) -> None:
    response = client.get("/users/me/profile-stats", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["error"] is None
    assert body["data"]["id"] == str(user.id)
    assert body["data"]["email"] == user.email
    assert body["data"]["username"] == "Trader"
    assert body["data"]["total_volume_credits"] == 0


def test_user_profile_stats_excludes_email(client, user, auth_headers) -> None:
    response = client.get(
        f"/users/{user.id}/profile-stats",
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "email" not in body["data"]
    assert body["data"]["username"] == "Trader"


def test_user_profile_stats_not_found(client, user, auth_headers) -> None:
    missing_id = uuid.uuid4()
    response = client.get(
        f"/users/{missing_id}/profile-stats",
        headers=auth_headers,
    )
    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["error"] == "User not found"
