"""Tests for StudySpot-style auth dependencies."""

import uuid

import pytest
from fastapi import HTTPException
from jose import jwt
from sqlalchemy.orm import Session

from backend.auth.dependencies import (
    credentials_error,
    decode_token,
    get_current_admin,
    get_user_from_payload,
)
from backend.auth.user import User
from backend.services import auth_service


def _encode(sub: str) -> str:
    return jwt.encode(
        {"sub": sub},
        auth_service.JWT_SECRET_KEY,
        algorithm=auth_service.JWT_ALGORITHM,
    )


def test_decode_token_returns_payload() -> None:
    token = _encode(str(uuid.uuid4()))
    payload = decode_token(token)
    assert "sub" in payload


def test_decode_token_rejects_invalid_token() -> None:
    with pytest.raises(HTTPException) as exc:
        decode_token("not-a-jwt")
    assert exc.value.status_code == 401
    assert exc.value.detail == "Could not validate credentials"


def test_get_user_from_payload_loads_user(db: Session, user: User) -> None:
    payload = {"sub": str(user.id)}
    loaded = get_user_from_payload(db, payload)
    assert loaded.id == user.id


def test_get_user_from_payload_rejects_missing_sub(db: Session) -> None:
    with pytest.raises(HTTPException) as exc:
        get_user_from_payload(db, {})
    assert exc.value.status_code == 401


def test_get_user_from_payload_rejects_unknown_user(db: Session) -> None:
    payload = {"sub": str(uuid.uuid4())}
    with pytest.raises(HTTPException) as exc:
        get_user_from_payload(db, payload)
    assert exc.value.status_code == 401


def test_get_current_admin_allows_admin(admin_user: User) -> None:
    assert get_current_admin(user=admin_user) == admin_user


def test_get_current_admin_rejects_non_admin(user: User) -> None:
    with pytest.raises(HTTPException) as exc:
        get_current_admin(user=user)
    assert exc.value.status_code == 403


def test_credentials_error_shape() -> None:
    exc = credentials_error()
    assert exc.status_code == 401
    assert exc.detail == "Could not validate credentials"
