"""Trade service layer.

Purpose:
- Validate trade requests and execute them against AMM pricing.
- Persist trade records and update user positions atomically.

Intended behavior:
- Provide the single domain-safe path for all market trade execution.
"""

