"""Authentication package.

StudySpot integration seam: the reused StudySpot backend owns the real Google
OAuth flow, User model, and JWT issuance. The modules here provide a minimal,
standards-compatible stand-in (a User model and a bearer-token verifier) so the
market/trade/position layer is runnable and testable before StudySpot lands.
Replace or re-point these imports when StudySpot is dropped in.
"""
