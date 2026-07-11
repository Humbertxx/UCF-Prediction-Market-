"""AI insight generation engine (Gemini-backed).

Purpose:
- Produce market insight summaries from price/time series data.
- Isolate Gemini prompting and response handling behind one service.

Intended behavior:
- Return structured insight content for market detail views.
- Degrade safely when the API key is missing or the model call fails.

Status: not implemented yet — planned for a later phase.
"""
