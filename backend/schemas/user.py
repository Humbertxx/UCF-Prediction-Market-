"""User profile API schemas."""

from typing import Optional

from pydantic import BaseModel, ConfigDict


class CategoryPnlOut(BaseModel):
    """Realized + unrealized P/L grouped by demo market category."""

    category: str
    pnl_credits: int


class UserProfileStatsData(BaseModel):
    """Identity + trading stats for profile views."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    username: str
    total_volume_credits: int
    total_pnl_credits: int
    category_pnl: list[CategoryPnlOut]
