"""Trade execution service.

The single domain-safe path for executing a trade. Everything happens in one
transaction with row-level locks (``SELECT ... FOR UPDATE``) on the market and
wallet rows, so concurrent bot + user trades cannot corrupt the pools, the
invariant, or a balance.
"""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.enums import MarketStatus, TradeSide
from backend.models.market import Market
from backend.models.position import Position
from backend.models.trade import Trade
from backend.models.wallet import Wallet
from backend.services import amm


class TradeError(Exception):
    """Raised when a trade cannot be executed. ``status_code`` maps to HTTP."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@dataclass
class TradeResult:
    trade_id: int
    market_id: str
    side: TradeSide
    shares: int
    cost: int
    yes_price_bps: int
    balance_after: int


def execute_trade(
    db: Session,
    *,
    user_id,
    market_id,
    side: TradeSide,
    amount: int,
) -> TradeResult:
    """Execute a buy for ``user_id`` and return the resulting state.

    Atomic: market pools, the trade record, the position, and the wallet balance
    are all updated in one committed transaction.
    """
    if amount <= 0:
        raise TradeError("Trade amount must be a positive integer", status_code=422)

    # Lock the market row for the duration of the transaction.
    market = db.execute(
        select(Market).where(Market.id == market_id).with_for_update()
    ).scalar_one_or_none()
    if market is None:
        raise TradeError("Market not found", status_code=404)
    if market.status != MarketStatus.trading:
        raise TradeError("Market is not open for trading", status_code=409)

    # Lock the wallet row and verify funds.
    wallet = db.execute(
        select(Wallet).where(Wallet.user_id == user_id).with_for_update()
    ).scalar_one_or_none()
    if wallet is None:
        raise TradeError("Wallet not found", status_code=404)
    if wallet.balance_credits < amount:
        raise TradeError("Insufficient balance", status_code=402)

    # Price the trade via the CPMM engine.
    if side == TradeSide.yes:
        shares, cost, new_yes, new_no = amm.buy_yes(market.pool_yes, market.pool_no, amount)
    else:
        shares, cost, new_yes, new_no = amm.buy_no(market.pool_yes, market.pool_no, amount)

    if shares <= 0:
        raise TradeError(
            "Amount too small to buy any shares at the current price",
            status_code=422,
        )

    yes_price_bps = amm.get_yes_price_bps(new_yes, new_no)

    # Apply pool movement + wallet debit.
    market.pool_yes = new_yes
    market.pool_no = new_no
    wallet.balance_credits -= cost

    # Upsert the position (lock if it already exists).
    position = db.execute(
        select(Position)
        .where(Position.user_id == user_id, Position.market_id == market_id)
        .with_for_update()
    ).scalar_one_or_none()
    if position is None:
        position = Position(
            user_id=user_id,
            market_id=market_id,
            yes_shares=0,
            no_shares=0,
            cost_basis_credits=0,
            realized_pnl=0,
        )
        db.add(position)
    if side == TradeSide.yes:
        position.yes_shares += shares
    else:
        position.no_shares += shares
    position.cost_basis_credits += cost

    # Record the immutable trade (also the price-history point).
    trade = Trade(
        market_id=market_id,
        user_id=user_id,
        is_bot=False,
        side=side,
        cost_credits=cost,
        shares=shares,
        yes_price_bps=yes_price_bps,
        pool_yes_after=new_yes,
        pool_no_after=new_no,
    )
    db.add(trade)

    db.commit()
    db.refresh(trade)

    return TradeResult(
        trade_id=trade.id,
        market_id=str(market_id),
        side=side,
        shares=shares,
        cost=cost,
        yes_price_bps=yes_price_bps,
        balance_after=wallet.balance_credits,
    )
