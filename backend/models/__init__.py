"""ORM models package.

Importing this package registers every model on the shared ``Base.metadata`` so
Alembic and test table creation see the full schema. The User import is the
StudySpot auth seam.
"""

from backend.auth.user import User
from backend.models.enums import MarketOutcome, MarketStatus, TradeSide
from backend.models.market import Market
from backend.models.position import Position
from backend.models.trade import Trade
from backend.models.wallet import Wallet

__all__ = [
    "User",
    "Market",
    "Trade",
    "Position",
    "Wallet",
    "MarketStatus",
    "MarketOutcome",
    "TradeSide",
]
