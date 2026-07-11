"""Auth routes for the standalone (Mode B) demo.

``POST /auth/demo`` upserts a user by email, grants a wallet, and returns an
app JWT. Same token shape StudySpot uses (``sub`` = user UUID) so
``get_current_user`` stays unchanged.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user, is_admin_user
from backend.auth.user import User
from backend.database import get_db
from backend.schemas.auth import DemoLoginRequest, TokenResponse
from backend.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/demo", response_model=TokenResponse)
def demo_login(payload: DemoLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        user = auth_service.get_or_create_demo_user(
            db,
            email=payload.email,
            name=payload.name,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    token = auth_service.create_access_token(user_id=user.id)
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        is_admin=is_admin_user(user),
    )


@router.get("/me", response_model=TokenResponse)
def me(user: User = Depends(get_current_user)) -> TokenResponse:
    """Return the current user profile + a fresh token (useful for session restore)."""
    return TokenResponse(
        access_token=auth_service.create_access_token(user_id=user.id),
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        is_admin=is_admin_user(user),
    )
