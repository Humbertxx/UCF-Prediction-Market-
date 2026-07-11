"""Auth helpers: JWT settings, token minting, and demo user upsert.

Mode B standalone: StudySpot-style JWT verification (``sub`` = user UUID) with
a local demo login that creates users — no Google OAuth required for the demo.
"""

from __future__ import annotations

import hashlib
import uuid
from typing import Optional

from jose import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.auth.user import User
from backend.config import get_settings
from backend.services.wallet_service import ensure_wallet

_settings = get_settings()

JWT_SECRET_KEY: str = _settings.jwt_secret
JWT_ALGORITHM: str = _settings.jwt_algorithm


def create_access_token(*, user_id: uuid.UUID) -> str:
    """Mint an app JWT with ``sub`` set to the user's UUID (StudySpot shape)."""
    return jwt.encode(
        {"sub": str(user_id)},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
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
