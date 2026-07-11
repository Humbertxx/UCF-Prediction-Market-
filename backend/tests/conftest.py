"""Shared pytest fixtures for backend unit and API tests."""

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import backend.models  # noqa: F401
from backend.auth.user import User
from backend.config import get_settings
from backend.database import Base, get_db
from backend.main import app
from backend.models.enums import MarketStatus
from backend.models.market import Market
from backend.models.wallet import Wallet
from backend.services import auth_service, market_service


@pytest.fixture
def db() -> Session:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(
        bind=engine, autoflush=False, autocommit=False, expire_on_commit=False
    )()
    yield session
    session.close()


@pytest.fixture
def user(db: Session) -> User:
    user = User(email="trader@example.com", display_name="Trader")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db: Session) -> User:
    user = User(email="admin@example.com", display_name="Admin", is_admin=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def wallet(db: Session, user: User) -> Wallet:
    settings = get_settings()
    wallet = Wallet(
        user_id=user.id,
        balance_credits=settings.starting_wallet_credits,
        initial_grant=settings.starting_wallet_credits,
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet


@pytest.fixture
def market(db: Session) -> Market:
    market_service.seed_demo_markets(db)
    return market_service.get_market_by_slug(db, "ucf-football-historical-replay")


@pytest.fixture
def seeded_market(db: Session) -> Market:
    """A market that is not yet open for trading."""
    market = Market(
        slug="seeded-only",
        title="Seeded market",
        description="Not trading yet",
        status=MarketStatus.seeded,
        pool_yes=market_service.INITIAL_POOL,
        pool_no=market_service.INITIAL_POOL,
        k_constant=market_service.INITIAL_POOL ** 2,
        p_true_bps=5000,
    )
    db.add(market)
    db.commit()
    db.refresh(market)
    return market


def _bearer_token(user: User) -> str:
    return jwt.encode(
        {"sub": str(user.id)},
        auth_service.JWT_SECRET_KEY,
        algorithm=auth_service.JWT_ALGORITHM,
    )


@pytest.fixture
def auth_headers(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {_bearer_token(user)}"}


@pytest.fixture
def admin_auth_headers(admin_user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {_bearer_token(admin_user)}"}


@pytest.fixture
def client(db: Session):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
