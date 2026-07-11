"""Admin-triggered demo bots.

Belief traders sample around each market's hidden ``p_true_bps`` and buy YES/NO
via ``trade_service.execute_bot_trade``. Import the runner module as::

    from backend.bots import bot_runner
    await bot_runner.bot_runner.start_belief_simulation(...)
"""
