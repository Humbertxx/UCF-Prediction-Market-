"""Auth schema file.

Request/response data shapes for auth endpoints live here.
"""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DemoLoginRequest(BaseModel):
    """Hackathon demo login — no Google OAuth required."""

    email: str = Field(min_length=3, max_length=320)
    name: Optional[str] = Field(default=None, max_length=255)


class GoogleAuthRequest(BaseModel):
    """Payload sent from frontend after Google sign-in (optional / future)."""

    id_token: str


class SupabaseAuthRequest(BaseModel):
    """Payload sent from frontend after Supabase email/password auth (optional)."""

    access_token: str


class TokenResponse(BaseModel):
    """JWT payload returned by login endpoints."""

    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: Optional[str] = None
    is_admin: bool = False

    model_config = ConfigDict(from_attributes=True)
