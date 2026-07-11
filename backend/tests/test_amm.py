"""Unit tests for the CPMM engine."""

import pytest

from backend.services import amm


def test_get_yes_price_bps_symmetric_pools() -> None:
    assert amm.get_yes_price_bps(100_000, 100_000) == 5000


def test_buy_yes_increases_yes_price() -> None:
    price_before = amm.get_yes_price_bps(100_000, 100_000)
    shares, cost, new_yes, new_no = amm.buy_yes(100_000, 100_000, 1_000)
    price_after = amm.get_yes_price_bps(new_yes, new_no)

    assert cost == 1_000
    assert shares > 0
    assert new_yes < 100_000
    assert new_no > 100_000
    assert price_after > price_before


def test_buy_no_decreases_yes_price() -> None:
    price_before = amm.get_yes_price_bps(100_000, 100_000)
    shares, cost, new_yes, new_no = amm.buy_no(100_000, 100_000, 1_000)
    price_after = amm.get_yes_price_bps(new_yes, new_no)

    assert cost == 1_000
    assert shares > 0
    assert new_yes > 100_000
    assert new_no < 100_000
    assert price_after < price_before


def test_k_invariant_drift_bounded_after_buy_yes() -> None:
    pool_yes, pool_no, spend = 100_000, 100_000, 5_000
    k = pool_yes * pool_no
    _, _, new_yes, new_no = amm.buy_yes(pool_yes, pool_no, spend)
    product = new_yes * new_no
    assert product <= k
    assert k - product < new_no


def test_integer_outputs_only() -> None:
    shares, cost, new_yes, new_no = amm.buy_yes(100_000, 100_000, 333)
    assert all(isinstance(v, int) for v in (shares, cost, new_yes, new_no))


def test_rejects_non_positive_spend() -> None:
    with pytest.raises(ValueError):
        amm.buy_yes(100_000, 100_000, 0)
