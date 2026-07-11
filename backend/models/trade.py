"""Trade domain model.

An immutable record of a single executed buy against a market. Doubles as the
price-history source: every row snapshots the resulting YES price and pool
state, so charts and the Gemini insight read from ``trades`` directly.

Bots trade with ``user_id`` NULL (``is_bot`` True) and only move the pools; they
get no wallet or position row.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base
from backend.models.enums import TradeSide

_autoincrement_pk = BigInteger().with_variant(Integer(), "sqlite")


class Trade(Base):
    __tablename__ = "trades"

    # BIGSERIAL gives monotonic ordering for price history + realtime feeds.
    id: Mapped[int] = mapped_column(_autoincrement_pk, primary_key=True, autoincrement=True)

    market_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("markets.id"), nullable=False
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    is_bot: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    bot_label: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)

    side: Mapped[TradeSide] = mapped_column(
        Enum(TradeSide, name="trade_side", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
    )

    # Integer credits paid and integer shares received.
    cost_credits: Mapped[int] = mapped_column(BigInteger, nullable=False)
    shares: Mapped[int] = mapped_column(BigInteger, nullable=False)

    # Post-trade snapshot for charts + full reconstruction/audit.
    yes_price_bps: Mapped[int] = mapped_column(Integer, nullable=False)
    pool_yes_after: Mapped[int] = mapped_column(BigInteger, nullable=False)
    pool_no_after: Mapped[int] = mapped_column(BigInteger, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    __table_args__ = (
        Index("ix_trades_market_id_id", "market_id", "id"),
        Index("ix_trades_market_created", "market_id", "created_at"),
    )
