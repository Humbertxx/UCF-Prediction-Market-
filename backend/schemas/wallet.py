"""Wallet API schemas."""

import uuid

from pydantic import BaseModel, ConfigDict


class WalletOut(BaseModel):
    """A user's virtual credit balance."""

    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    balance_credits: int
    initial_grant: int
