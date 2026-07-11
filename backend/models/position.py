"""Position domain model.

A user's aggregate holdings in one market: net YES/NO shares plus the credit
cost basis used for P/L. One row per (user, market). ``realized_pnl`` is set at
resolution/payout (a later phase); mark-to-market P/L is derived on read as
``yes_shares*p_yes + no_shares*(1-p_yes) - cost_basis``.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base

_autoincrement_pk = BigInteger().with_variant(Integer(), "sqlite")


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(_autoincrement_pk, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    market_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("markets.id"), nullable=False
    )

    yes_shares: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    no_shares: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    cost_basis_credits: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    realized_pnl: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint("user_id", "market_id", name="uq_positions_user_market"),
    )
