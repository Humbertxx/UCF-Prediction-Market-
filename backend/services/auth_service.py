"""Auth helpers: JWT settings, Google ID-token verify, demo/Google user upsert.

Mode B standalone: StudySpot-shaped JWT (``sub`` = user UUID). Login paths:
- ``POST /auth/demo`` — hackathon fallback
- ``POST /auth/google`` — Google Identity Services ``id_token`` → app JWT
"""

from __future__ import annotations

import hashlib
import uuid
from dataclasses import dataclass
from typing import Optional

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from jose import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth.user import User
from backend.config import get_settings
from backend.services.wallet_service import ensure_wallet

_settings = get_settings()

JWT_SECRET_KEY: str = _settings.jwt_secret
JWT_ALGORITHM: str = _settings.jwt_algorithm


@dataclass(frozen=True)
class GoogleIdentity:
    """Verified claims from a Google ID token."""

    google_id: str
    email: str
    name: Optional[str]
    profile_picture: Optional[str]


class AuthError(Exception):
    """Auth business error with an HTTP-ish status code."""

    def __init__(self, message: str, *, status_code: int = 401) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def create_access_token(*, user_id: uuid.UUID) -> str:
    """Mint an app JWT with ``sub`` set to the user's UUID (StudySpot shape)."""
    return jwt.encode(
        {"sub": str(user_id)},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def verify_google_id_token(raw_token: str) -> GoogleIdentity:
    """Verify a Google GIS ID token against ``GOOGLE_CLIENT_ID``."""
    client_id = get_settings().google_client_id.strip()
    if not client_id:
        raise AuthError(
            "Google OAuth is not configured (GOOGLE_CLIENT_ID)",
            status_code=503,
        )
    if not raw_token or not raw_token.strip():
        raise AuthError("Missing Google id_token")

    try:
        claims = google_id_token.verify_oauth2_token(
            raw_token.strip(),
            google_requests.Request(),
            client_id,
        )
    except ValueError as exc:
        raise AuthError("Invalid Google id_token") from exc

    sub = claims.get("sub")
    email = claims.get("email")
    if not sub or not email:
        raise AuthError("Google token missing sub/email")

    email_verified = claims.get("email_verified", False)
    if email_verified is False:
        raise AuthError("Google email is not verified")

    return GoogleIdentity(
        google_id=str(sub),
        email=str(email).strip().lower(),
        name=(str(claims["name"]).strip() if claims.get("name") else None),
        profile_picture=(
            str(claims["picture"]).strip() if claims.get("picture") else None
        ),
    )


def _demo_google_id(email: str) -> str:
    """Stable synthetic google_id for demo users (column is NOT NULL + unique)."""
    digest = hashlib.sha256(email.strip().lower().encode("utf-8")).hexdigest()[:32]
    return f"demo-{digest}"


def get_or_create_demo_user(
    db: Session,
    *,
    email: str,
    name: Optional[str] = None,
) -> User:
    """Find or create a user by email and ensure they have a wallet."""
    normalized = email.strip().lower()
    if not normalized or "@" not in normalized:
        raise ValueError("A valid email is required")

    user = db.execute(select(User).where(User.email == normalized)).scalar_one_or_none()
    if user is None:
        user = User(
            google_id=_demo_google_id(normalized),
            email=normalized,
            name=(name.strip() if name and name.strip() else normalized.split("@")[0]),
        )
        db.add(user)
        db.flush()
    elif name and name.strip() and not user.name:
        user.name = name.strip()
        db.flush()

    ensure_wallet(db, user.id)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_google_user(db: Session, identity: GoogleIdentity) -> User:
    """Upsert a user from verified Google claims; grant wallet if missing."""
    user = db.execute(
        select(User).where(User.google_id == identity.google_id)
    ).scalar_one_or_none()

    if user is None:
        # Prefer linking an existing demo row with the same email.
        user = db.execute(
            select(User).where(User.email == identity.email)
        ).scalar_one_or_none()

    if user is None:
        user = User(
            google_id=identity.google_id,
            email=identity.email,
            name=identity.name,
            profile_picture=identity.profile_picture,
        )
        db.add(user)
        db.flush()
    else:
        user.google_id = identity.google_id
        user.email = identity.email
        if identity.name:
            user.name = identity.name
        if identity.profile_picture:
            user.profile_picture = identity.profile_picture
        db.flush()

    ensure_wallet(db, user.id)
    db.commit()
    db.refresh(user)
    return user
