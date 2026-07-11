"""Shared auth helper file.

Login-check helpers are kept in one reusable place. Routes depend on
``get_current_user`` / ``get_current_admin`` so StudySpot can swap internals
without touching market/trade/position handlers.
"""

from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.auth.user import User
from backend.database import get_db
from backend.services import auth_service

# tokenUrl documents the login endpoint for OpenAPI; actual Google route TBD.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/google", auto_error=False)
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/google", auto_error=False)


def credentials_error() -> HTTPException:
    """Standard 401 for invalid or missing bearer credentials."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )


def configuration_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="JWT configuration is missing (JWT_SECRET_KEY)",
    )


def decode_token(token: str) -> dict[str, Any]:
    """Decode JWT and return the payload dictionary."""
    if not auth_service.JWT_SECRET_KEY:
        raise configuration_error()
    try:
        payload = jwt.decode(
            token,
            auth_service.JWT_SECRET_KEY,
            algorithms=[auth_service.JWT_ALGORITHM],
        )
    except JWTError:
        raise credentials_error()

    if not isinstance(payload, dict):
        raise credentials_error()

    return payload


def get_user_from_payload(db: Session, payload: dict[str, Any]) -> User:
    """Resolve ``sub`` from the bearer token payload to a database user."""
    sub = payload.get("sub")
    if not sub:
        raise credentials_error()
    try:
        user_id = uuid.UUID(str(sub))
    except (ValueError, TypeError):
        raise credentials_error()

    user = db.get(User, user_id)
    if user is None:
        raise credentials_error()

    return user


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Required authentication dependency. Missing token fails."""
    if not token:
        raise credentials_error()
    payload = decode_token(token=token)
    return get_user_from_payload(db=db, payload=payload)


def get_optional_current_user(
    token: Optional[str] = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Optional authentication: returns None when no token is supplied."""
    if not token:
        return None
    payload = decode_token(token=token)
    return get_user_from_payload(db=db, payload=payload)


def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user
