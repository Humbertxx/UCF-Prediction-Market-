"""Features API routes — showcase endpoints for the Features tab."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.insight import AiMarketBriefResponse
from backend.services import market_brief_service

router = APIRouter(prefix="/features", tags=["features"])


@router.get("/ai-market-brief", response_model=AiMarketBriefResponse)
def get_ai_market_brief(db: Session = Depends(get_db)) -> AiMarketBriefResponse:
    """Batch Gemini brief for all markets (uses per-market cache + fallbacks)."""
    return market_brief_service.get_ai_market_brief(db)
