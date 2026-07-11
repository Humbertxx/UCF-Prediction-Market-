"""Domain enums shared across models, schemas, and services."""

import enum


class MarketStatus(str, enum.Enum):
    """Market lifecycle. The demo's "open" market simply stays ``trading``."""

    seeded = "seeded"
    trading = "trading"
    resolving = "resolving"
    resolved = "resolved"


class MarketOutcome(str, enum.Enum):
    """Resolved outcome of a market."""

    yes = "yes"
    no = "no"


class TradeSide(str, enum.Enum):
    """Which side a trade buys. All trades are buys (selling is out of scope)."""

    yes = "yes"
    no = "no"
