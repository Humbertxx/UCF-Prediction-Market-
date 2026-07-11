"""Add prediction-market tables (markets, trades, positions, wallets).

Revision ID: 20260711_0001
Revises:
Create Date: 2026-07-11

Additive migration: assumes the StudySpot ``users`` table already exists.
Does not modify existing auth/user tables.
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260711_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

market_status = sa.Enum(
    "seeded", "trading", "resolving", "resolved", name="market_status"
)
market_outcome = sa.Enum("yes", "no", name="market_outcome")
trade_side = sa.Enum("yes", "no", name="trade_side")


def upgrade() -> None:
    market_status.create(op.get_bind(), checkfirst=True)
    market_outcome.create(op.get_bind(), checkfirst=True)
    trade_side.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "markets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", market_status, nullable=False),
        sa.Column("pool_yes", sa.BigInteger(), nullable=False),
        sa.Column("pool_no", sa.BigInteger(), nullable=False),
        sa.Column("k_constant", sa.BigInteger(), nullable=False),
        sa.Column("p_true_bps", sa.Integer(), nullable=False),
        sa.Column("resolution_outcome", market_outcome, nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by", sa.Uuid(), nullable=True),
        sa.Column("resolution_evidence", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["resolved_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_markets_slug", "markets", ["slug"], unique=True)
    op.create_index("ix_markets_status", "markets", ["status"], unique=False)

    op.create_table(
        "wallets",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("balance_credits", sa.BigInteger(), nullable=False),
        sa.Column("initial_grant", sa.BigInteger(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("user_id"),
    )

    op.create_table(
        "positions",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("market_id", sa.Uuid(), nullable=False),
        sa.Column("yes_shares", sa.BigInteger(), nullable=False),
        sa.Column("no_shares", sa.BigInteger(), nullable=False),
        sa.Column("cost_basis_credits", sa.BigInteger(), nullable=False),
        sa.Column("realized_pnl", sa.BigInteger(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["market_id"], ["markets.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "market_id", name="uq_positions_user_market"),
    )

    op.create_table(
        "trades",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("market_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("is_bot", sa.Boolean(), nullable=False),
        sa.Column("bot_label", sa.String(length=80), nullable=True),
        sa.Column("side", trade_side, nullable=False),
        sa.Column("cost_credits", sa.BigInteger(), nullable=False),
        sa.Column("shares", sa.BigInteger(), nullable=False),
        sa.Column("yes_price_bps", sa.Integer(), nullable=False),
        sa.Column("pool_yes_after", sa.BigInteger(), nullable=False),
        sa.Column("pool_no_after", sa.BigInteger(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["market_id"], ["markets.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trades_created_at", "trades", ["created_at"], unique=False)
    op.create_index("ix_trades_market_created", "trades", ["market_id", "created_at"])
    op.create_index("ix_trades_market_id_id", "trades", ["market_id", "id"])
    op.create_index("ix_trades_user_id", "trades", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_trades_user_id", table_name="trades")
    op.drop_index("ix_trades_market_id_id", table_name="trades")
    op.drop_index("ix_trades_market_created", table_name="trades")
    op.drop_index("ix_trades_created_at", table_name="trades")
    op.drop_table("trades")

    op.drop_table("positions")
    op.drop_table("wallets")

    op.drop_index("ix_markets_status", table_name="markets")
    op.drop_index("ix_markets_slug", table_name="markets")
    op.drop_table("markets")

    bind = op.get_bind()
    trade_side.drop(bind, checkfirst=True)
    market_outcome.drop(bind, checkfirst=True)
    market_status.drop(bind, checkfirst=True)
