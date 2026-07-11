"""Wallet domain model.

Holds a user's virtual credit balance. Separate, additive table keyed by
``user_id`` so the reused StudySpot user table is never modified. Balance is an
integer running total, decremented atomically inside the trade transaction.
"""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), primary_key=True
    )
    balance_credits: Mapped[int] = mapped_column(BigInteger, nullable=False)
    initial_grant: Mapped[int] = mapped_column(BigInteger, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
