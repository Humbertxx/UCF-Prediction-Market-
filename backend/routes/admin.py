"""Admin API routes for privileged operations (bot simulation)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_admin
from backend.auth.user import User
from backend.bots import bot_runner
from backend.bots.scripted_sequence import (
    convergence_toward_yes_sequence,
    replay_scripted_sequence,
)
from backend.database import get_db
from backend.schemas.admin import (
    ResolveMarketRequest,
    ResolveMarketResponse,
    SimulateBurstRequest,
    SimulateBurstResponse,
    SimulateStartRequest,
    SimulateStatusResponse,
    SimulateStopRequest,
)
from backend.services import market_service, resolution_service, trade_service
from backend.models.enums import MarketOutcome

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/simulate/start", response_model=SimulateStatusResponse)
async def start_simulation(
    payload: SimulateStartRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> SimulateStatusResponse:
    market = market_service.get_market(db, payload.market_id)
    if market is None:
        raise HTTPException(status_code=404, detail="Market not found")

    status = await bot_runner.bot_runner.start_belief_simulation(
        payload.market_id,
        bot_label=payload.bot_label,
        rng_seed=payload.rng_seed,
    )
    return SimulateStatusResponse(
        market_id=status.market_id,
        running=status.running,
        trades_executed=status.trades_executed,
        skipped_ticks=status.skipped_ticks,
        last_reason=status.last_reason,
    )


@router.post("/simulate/stop", response_model=SimulateStatusResponse)
async def stop_simulation(
    payload: SimulateStopRequest,
    _admin: User = Depends(get_current_admin),
) -> SimulateStatusResponse:
    status = await bot_runner.bot_runner.stop_simulation(payload.market_id)
    if status is None:
        raise HTTPException(status_code=404, detail="No simulation running for this market")
    return SimulateStatusResponse(
        market_id=status.market_id,
        running=status.running,
        trades_executed=status.trades_executed,
        skipped_ticks=status.skipped_ticks,
        last_reason=status.last_reason,
    )


@router.get("/simulate/{market_id}/status", response_model=SimulateStatusResponse)
def simulation_status(
    market_id: uuid.UUID,
    _admin: User = Depends(get_current_admin),
) -> SimulateStatusResponse:
    status = bot_runner.bot_runner.get_status(market_id)
    if status is None:
        return SimulateStatusResponse(
            market_id=market_id,
            running=False,
            trades_executed=0,
            skipped_ticks=0,
            last_reason=None,
        )
    return SimulateStatusResponse(
        market_id=status.market_id,
        running=status.running,
        trades_executed=status.trades_executed,
        skipped_ticks=status.skipped_ticks,
        last_reason=status.last_reason,
    )


@router.post("/simulate/burst", response_model=SimulateBurstResponse)
def simulate_burst(
    payload: SimulateBurstRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
) -> SimulateBurstResponse:
    market = market_service.get_market(db, payload.market_id)
    if market is None:
        raise HTTPException(status_code=404, detail="Market not found")

    label = payload.bot_label or payload.mode

    if payload.mode == "scripted":
        steps = convergence_toward_yes_sequence(payload.trade_count)
        executed = replay_scripted_sequence(
            db,
            market_id=payload.market_id,
            steps=steps,
            bot_label=label,
        )
    else:
        try:
            executed = bot_runner.bot_runner.run_belief_burst(
                db,
                market_id=payload.market_id,
                trade_count=payload.trade_count,
                bot_label=label,
                rng_seed=payload.rng_seed,
            )
        except trade_service.TradeError as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    db.refresh(market)
    return SimulateBurstResponse(
        market_id=payload.market_id,
        mode=payload.mode,
        trades_executed=executed,
        yes_price_bps=market_service.yes_price_bps(market),
    )


@router.post("/markets/{market_id}/resolve", response_model=ResolveMarketResponse)
def resolve_market(
    market_id: uuid.UUID,
    payload: ResolveMarketRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> ResolveMarketResponse:
    outcome = MarketOutcome(payload.outcome)
    try:
        result = resolution_service.resolve_market(
            db,
            market_id=market_id,
            outcome=outcome,
            resolved_by=admin.id,
            evidence=payload.evidence,
        )
    except resolution_service.ResolutionError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return ResolveMarketResponse(
        market_id=result.market_id,
        outcome=result.outcome.value,
        positions_settled=result.positions_settled,
        total_payout_credits=result.total_payout_credits,
        resolved_at=result.resolved_at,
    )
