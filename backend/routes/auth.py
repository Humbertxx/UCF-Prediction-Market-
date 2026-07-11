"""Auth routes: demo login + Google ID-token exchange → app JWT.

``POST /auth/google`` accepts a Google Identity Services ``id_token`` (StudySpot
shape). ``POST /auth/demo`` remains the hackathon fallback.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user, is_admin_user
from backend.auth.user import User
from backend.database import get_db
from backend.schemas.auth import DemoLoginRequest, GoogleAuthRequest, TokenResponse
from backend.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=auth_service.create_access_token(user_id=user.id),
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        is_admin=is_admin_user(user),
    )


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

    return _token_response(user)


@router.post("/google", response_model=TokenResponse)
def google_login(
    payload: GoogleAuthRequest, db: Session = Depends(get_db)
) -> TokenResponse:
    try:
        identity = auth_service.verify_google_id_token(payload.id_token)
        user = auth_service.get_or_create_google_user(db, identity)
    except auth_service.AuthError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return _token_response(user)


@router.get("/me", response_model=TokenResponse)
def me(user: User = Depends(get_current_user)) -> TokenResponse:
    """Return the current user profile + a fresh token (session restore)."""
    return _token_response(user)
