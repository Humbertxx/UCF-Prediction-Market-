"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import get_settings
from backend.database import Base, SessionLocal, engine
from backend.routes import insights, markets, positions, trades
from backend.services import market_service
from backend.services.wallet_service import grant_wallets_for_all_users

# Import models so they register on Base.metadata before create_all / Alembic.
import backend.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            market_service.seed_demo_markets(db)
            grant_wallets_for_all_users(db)
        finally:
            db.close()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="UCF Prediction Market API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(markets.router)
    app.include_router(trades.router)
    app.include_router(positions.router)
    app.include_router(insights.router)

    return app


app = create_app()
