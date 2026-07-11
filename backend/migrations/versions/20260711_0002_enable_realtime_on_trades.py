"""Enable Supabase realtime (postgres_changes) on the trades table.

Revision ID: 20260711_0002
Revises: 20260711_0001
Create Date: 2026-07-11

Adds ``trades`` to the ``supabase_realtime`` publication and grants the anon /
authenticated roles SELECT on it, so the browser (publishable key) receives
INSERT events for the live trade feed. Trades are already public market data
via unauthenticated REST endpoints; ``user_id`` is a non-PII UUID. The backend
connects as the ``postgres`` role, which bypasses RLS, so it is unaffected.

Postgres-only: guarded to a no-op on other dialects (e.g. the SQLite test DB)
and on plain Postgres that lacks the Supabase publication / roles.
"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260711_0002"
down_revision: Union[str, None] = "20260711_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_ADD_TO_PUBLICATION = """
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime'
             AND schemaname = 'public'
             AND tablename = 'trades'
       ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.trades';
    END IF;
END $$;
"""

# CREATE POLICY has no IF NOT EXISTS; drop-then-create keeps it idempotent.
# Guarded on the anon role existing so this is safe on non-Supabase Postgres.
_CREATE_POLICY = """
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        DROP POLICY IF EXISTS realtime_read_trades ON public.trades;
        EXECUTE 'CREATE POLICY realtime_read_trades ON public.trades '
                'FOR SELECT TO anon, authenticated USING (true)';
    END IF;
END $$;
"""

_DROP_POLICY = "DROP POLICY IF EXISTS realtime_read_trades ON public.trades;"

_DROP_FROM_PUBLICATION = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'trades'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.trades';
    END IF;
END $$;
"""


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    op.execute(_ADD_TO_PUBLICATION)
    op.execute(_CREATE_POLICY)


def downgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    op.execute(_DROP_POLICY)
    op.execute(_DROP_FROM_PUBLICATION)
