"""Market domain model.

Represents a binary prediction market. Holds the CPMM liquidity pools
(``pool_yes`` = x, ``pool_no`` = y, invariant ``x*y=k``), the hidden true
probability used by bots, and resolution state. All money-like values are
integers per the DB conventions.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base
from backend.models.enums import MarketOutcome, MarketStatus


def _enum_values(enum_cls):
    return [member.value for member in enum_cls]


class Market(Base):
    __tablename__ = "markets"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text, default="")

    status: Mapped[MarketStatus] = mapped_column(
        Enum(MarketStatus, name="market_status", values_callable=_enum_values),
        default=MarketStatus.seeded,
        index=True,
    )

    # CPMM pools (integers). k_constant is stored for invariant checks and audit.
    pool_yes: Mapped[int] = mapped_column(BigInteger)
    pool_no: Mapped[int] = mapped_column(BigInteger)
    k_constant: Mapped[int] = mapped_column(BigInteger)

    # Hidden "true" probability the crowd/bots converge toward, in basis points
    # (0..10000). Not a monetary value; stored as an integer to avoid floats.
    p_true_bps: Mapped[int] = mapped_column(Integer)

    # Resolution state (populated in a later phase).
    resolution_outcome: Mapped[Optional[MarketOutcome]] = mapped_column(
        Enum(MarketOutcome, name="market_outcome", values_callable=_enum_values),
        nullable=True,
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    resolution_evidence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
