"""Backend application entrypoint.

Purpose:
- Build and configure the web API application instance.
- Register route modules (markets, trades, positions, leaderboard, admin).
- Initialize shared runtime concerns such as auth wiring and health checks.

Intended behavior:
- Start the Bloomknights backend service.
- Expose stable HTTP endpoints used by the frontend and bot runner.
"""

