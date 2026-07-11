"""Deterministic bot action sequences for demos and tests.

Replay fixed (side, amount) steps so market dynamics are predictable without
depending on random belief draws.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy.orm import Session

from backend.models.enums import TradeSide
from backend.services import trade_service


@dataclass(frozen=True)
class ScriptedStep:
    side: TradeSide
    amount_credits: int


def convergence_toward_yes_sequence(trade_count: int) -> list[ScriptedStep]:
    """Alternate YES-heavy buys to push price up in a repeatable pattern."""
    steps: list[ScriptedStep] = []
    for i in range(trade_count):
        if i % 4 == 3:
            steps.append(ScriptedStep(side=TradeSide.no, amount_credits=75))
        else:
            steps.append(ScriptedStep(side=TradeSide.yes, amount_credits=150))
    return steps


def replay_scripted_sequence(
    db: Session,
    *,
    market_id: uuid.UUID,
    steps: list[ScriptedStep],
    bot_label: str = "scripted",
) -> int:
    """Execute each scripted step synchronously. Returns trades executed."""
    executed = 0
    for step in steps:
        try:
            trade_service.execute_bot_trade(
                db,
                market_id=market_id,
                side=step.side,
                amount=step.amount_credits,
                bot_label=bot_label,
            )
            executed += 1
        except trade_service.TradeError:
            break
    return executed
