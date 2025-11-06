"""FastAPI backend package for the Bagh Online cloud stack."""

from __future__ import annotations

from functools import lru_cache

from .config import APISettings


@lru_cache
def get_settings() -> APISettings:
    """Return cached API settings."""
    return APISettings()


__all__ = ["get_settings", "APISettings"]
