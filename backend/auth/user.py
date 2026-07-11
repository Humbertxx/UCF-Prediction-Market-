"""User model (StudySpot-compatible columns, standalone Mode B).

Lives under ``auth/`` as the auth boundary — market/trade/position code imports
from here. Column layout matches StudySpot ``models/user.py`` so patterns and
JWT ``sub`` resolution stay interchangeable; this repo owns its own ``users``
table on Supabase (does not share StudySpot's database).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class User(Base):
    """One row per app user — column layout matches StudySpot ``models/user.py``."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    google_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    profile_picture: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    @property
    def display_name(self) -> str:
        """Compatibility alias for UI code that expects a display label."""
        return self.name or ""
