"""Tests for auth request/response schemas."""

from backend.schemas.auth import (
    GoogleAuthRequest,
    SupabaseAuthRequest,
    TokenResponse,
)


def test_google_auth_request_requires_id_token() -> None:
    payload = GoogleAuthRequest(id_token="google-id-token")
    assert payload.id_token == "google-id-token"


def test_supabase_auth_request_requires_access_token() -> None:
    payload = SupabaseAuthRequest(access_token="supabase-access-token")
    assert payload.access_token == "supabase-access-token"


def test_token_response_defaults_to_bearer() -> None:
    payload = TokenResponse(access_token="app-jwt")
    assert payload.access_token == "app-jwt"
    assert payload.token_type == "bearer"
