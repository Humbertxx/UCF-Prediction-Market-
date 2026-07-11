"""SQLAlchemy engine, session, and declarative base.

This is the single ``Base`` all models bind to, so one ``metadata`` drives both
Alembic and test table creation.

StudySpot integration seam: when the StudySpot backend is dropped in, point its
models at this ``Base`` (or re-export StudySpot's ``Base`` here) so the existing
user/auth tables and the new market/trade/position tables share one metadata.
"""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from backend.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    """Declarative base shared by every ORM model."""


def _engine_kwargs(url: str) -> dict:
    if url.startswith("sqlite"):
        # Needed for SQLite when used across threads (tests, dev server).
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_pre_ping": True}


engine = create_engine(settings.database_url, **_engine_kwargs(settings.database_url))

# expire_on_commit=False lets us read attributes (e.g. wallet balance) after the
# trade transaction commits without emitting another SELECT.
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    class_=Session,
)


def get_db() -> Iterator[Session]:
    """FastAPI dependency yielding a request-scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
