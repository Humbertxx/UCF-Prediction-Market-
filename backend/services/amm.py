"""Constant-product market maker (CPMM) math.

All market pricing mechanics live here. Pure, integer-only, side-effect-free
functions so they are trivially unit-testable and never touch the DB.

Model
-----
- ``pool_yes`` = x, ``pool_no`` = y, invariant ``x * y = k``.
- YES spot price ``p_yes = y / (x + y)`` (returned in basis points, 0..10000).
- Buying YES pushes credits into the NO reserve; k is preserved so the YES
  reserve shrinks and the YES price rises. ``buy_no`` is symmetric.

Rounding
--------
Shares are floored to integers; the buyer is charged the full integer ``spend``.
The original ``k`` is treated as the invariant of record. Integer flooring makes
the realized product ``new_yes * new_no`` drift from ``k`` by less than the
opposite reserve; tests assert this bound.
"""

BPS_DENOMINATOR = 10_000


def get_yes_price_bps(pool_yes: int, pool_no: int) -> int:
    """Return the YES spot price in basis points (0..10000)."""
    total = pool_yes + pool_no
    if total <= 0:
        raise ValueError("pools must be positive")
    return round(BPS_DENOMINATOR * pool_no / total)


def buy_yes(pool_yes: int, pool_no: int, spend: int) -> tuple[int, int, int, int]:
    """Buy YES shares with ``spend`` credits.

    Returns ``(shares, cost, new_pool_yes, new_pool_no)``.
    """
    _validate(pool_yes, pool_no, spend)
    k = pool_yes * pool_no
    new_no = pool_no + spend
    new_yes = k // new_no
    shares = pool_yes - new_yes
    return shares, spend, new_yes, new_no


def buy_no(pool_yes: int, pool_no: int, spend: int) -> tuple[int, int, int, int]:
    """Buy NO shares with ``spend`` credits.

    Returns ``(shares, cost, new_pool_yes, new_pool_no)``.
    """
    _validate(pool_yes, pool_no, spend)
    k = pool_yes * pool_no
    new_yes = pool_yes + spend
    new_no = k // new_yes
    shares = pool_no - new_no
    return shares, spend, new_yes, new_no


def _validate(pool_yes: int, pool_no: int, spend: int) -> None:
    if pool_yes <= 0 or pool_no <= 0:
        raise ValueError("pools must be positive")
    if spend <= 0:
        raise ValueError("spend must be a positive integer")
