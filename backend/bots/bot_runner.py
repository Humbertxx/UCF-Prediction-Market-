"""Bot orchestration runtime.

Admin-triggered belief-trader loops with a 1–3 second cadence. Strategy logic
lives in ``belief_trader``; this module handles scheduling, session lifecycle,
logging, and start/stop controls only.
"""

from __future__ import annotations

import asyncio
import logging
import random
import uuid
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy.orm import Session

from backend.bots.belief_trader import BeliefTrader, BeliefTraderConfig, TradeIntent
from backend.database import SessionLocal
from backend.models.market import Market
from backend.services import market_service, trade_service

logger = logging.getLogger(__name__)

MIN_INTERVAL_SECONDS = 1.0
MAX_INTERVAL_SECONDS = 3.0


@dataclass
class SimulationStatus:
    market_id: uuid.UUID
    running: bool = False
    trades_executed: int = 0
    skipped_ticks: int = 0
    last_reason: str | None = None
    _task: asyncio.Task | None = field(default=None, repr=False)


class BotRunner:
    """In-process registry of admin-started simulations (demo-safe, single worker)."""

    def __init__(self) -> None:
        self._simulations: dict[uuid.UUID, SimulationStatus] = {}
        self._lock = asyncio.Lock()

    def get_status(self, market_id: uuid.UUID) -> SimulationStatus | None:
        state = self._simulations.get(market_id)
        if state is None:
            return None
        return SimulationStatus(
            market_id=state.market_id,
            running=state.running,
            trades_executed=state.trades_executed,
            skipped_ticks=state.skipped_ticks,
            last_reason=state.last_reason,
        )

    async def start_belief_simulation(
        self,
        market_id: uuid.UUID,
        *,
        bot_label: str = "belief",
        config: BeliefTraderConfig | None = None,
        rng_seed: int | None = None,
    ) -> SimulationStatus:
        """Start a background belief-trader loop for one market."""
        async with self._lock:
            await self._stop_locked(market_id)

            state = SimulationStatus(market_id=market_id, running=True)
            self._simulations[market_id] = state
            state._task = asyncio.create_task(
                self._belief_loop(
                    state,
                    bot_label=bot_label,
                    config=config,
                    rng_seed=rng_seed,
                ),
                name=f"bot-sim-{market_id}",
            )
            return self.get_status(market_id)  # type: ignore[return-value]

    async def stop_simulation(self, market_id: uuid.UUID) -> SimulationStatus | None:
        async with self._lock:
            return await self._stop_locked(market_id)

    async def _stop_locked(self, market_id: uuid.UUID) -> SimulationStatus | None:
        state = self._simulations.get(market_id)
        if state is None:
            return None

        state.running = False
        if state._task is not None and not state._task.done():
            state._task.cancel()
            try:
                await state._task
            except asyncio.CancelledError:
                pass
        return self.get_status(market_id)

    async def stop_all(self) -> None:
        async with self._lock:
            for market_id in list(self._simulations):
                await self._stop_locked(market_id)

    def run_belief_burst(
        self,
        db: Session,
        *,
        market_id: uuid.UUID,
        trade_count: int,
        bot_label: str = "belief",
        config: BeliefTraderConfig | None = None,
        rng_seed: int | None = None,
    ) -> int:
        """Run up to ``trade_count`` belief trades synchronously (tests / quick demo)."""
        trader = BeliefTrader(
            bot_label=bot_label,
            config=config,
            rng=random.Random(rng_seed),
        )
        executed = 0
        for _ in range(trade_count):
            market = market_service.get_market(db, market_id)
            if market is None:
                raise trade_service.TradeError("Market not found", status_code=404)

            intent = trader.decide(market)
            if intent is None:
                continue

            self._execute_intent(db, intent, bot_label=bot_label)
            executed += 1
        return executed

    async def _belief_loop(
        self,
        state: SimulationStatus,
        *,
        bot_label: str,
        config: BeliefTraderConfig | None,
        rng_seed: int | None,
    ) -> None:
        trader = BeliefTrader(
            bot_label=bot_label,
            config=config,
            rng=random.Random(rng_seed),
        )

        try:
            while state.running:
                await asyncio.sleep(
                    random.uniform(MIN_INTERVAL_SECONDS, MAX_INTERVAL_SECONDS)
                )
                if not state.running:
                    break

                db = SessionLocal()
                try:
                    market = market_service.get_market(db, state.market_id)
                    if market is None:
                        logger.warning("bot simulation stopped: market %s missing", state.market_id)
                        state.running = False
                        break

                    intent = trader.decide(market)
                    if intent is None:
                        state.skipped_ticks += 1
                        state.last_reason = "no trade: edge below threshold or market not trading"
                        continue

                    result = self._execute_intent(db, intent, bot_label=bot_label)
                    state.trades_executed += 1
                    state.last_reason = intent.reason
                    logger.info(
                        "bot trade market=%s side=%s cost=%s yes_bps=%s label=%s reason=%s",
                        state.market_id,
                        result.side.value,
                        result.cost,
                        result.yes_price_bps,
                        bot_label,
                        intent.reason,
                    )
                except trade_service.TradeError as exc:
                    logger.warning(
                        "bot trade skipped market=%s: %s",
                        state.market_id,
                        exc.message,
                    )
                    state.last_reason = exc.message
                finally:
                    db.close()
        except asyncio.CancelledError:
            state.running = False
            raise

    def _execute_intent(
        self,
        db: Session,
        intent: TradeIntent,
        *,
        bot_label: str,
    ) -> trade_service.BotTradeResult:
        return trade_service.execute_bot_trade(
            db,
            market_id=intent.market_id,
            side=intent.side,
            amount=intent.amount_credits,
            bot_label=bot_label,
        )


bot_runner = BotRunner()
