"""Shared auth configuration (StudySpot integration seam).

Centralizes JWT settings so dependencies and auth routes read the same values.
"""

from backend.config import get_settings

_settings = get_settings()

JWT_SECRET_KEY: str = _settings.jwt_secret
JWT_ALGORITHM: str = _settings.jwt_algorithm
