"""Runtime configuration.

Loads settings from environment variables (and an optional local ``.env``).
Money-adjacent knobs like the starting wallet grant live here so the demo can be
tuned without touching business logic.
"""

from functools import lru_cache

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )

    # Database. Defaults to a local SQLite file so the app is runnable without a
    # provisioned Postgres; Supabase Postgres is supplied via DATABASE_URL in prod.
    database_url: str = "sqlite+pysqlite:///./ucf_prediction_market.db"

    # App JWT verification (tokens are issued by the reused StudySpot OAuth flow).
    jwt_secret: str = Field(
        default="dev-insecure-secret-change-me",
        validation_alias=AliasChoices("JWT_SECRET", "JWT_SECRET_KEY"),
    )
    jwt_algorithm: str = Field(
        default="HS256",
        validation_alias=AliasChoices("JWT_ALGORITHM", "JWT_ALGO"),
    )

    # Virtual credits granted to a wallet on creation.
    starting_wallet_credits: int = 10_000

    # Dev convenience: create tables + seed on startup when no Alembic run is used.
    auto_create_tables: bool = False

    @field_validator("database_url", mode="before")
    @classmethod
    def default_database_url_when_blank(cls, value: object) -> object:
        if value is None or (isinstance(value, str) and not value.strip()):
            return "sqlite+pysqlite:///./ucf_prediction_market.db"
        return value

    @field_validator("jwt_secret", mode="before")
    @classmethod
    def default_jwt_secret_when_blank(cls, value: object) -> object:
        if value is None or (isinstance(value, str) and not value.strip()):
            return "dev-insecure-secret-change-me"
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
