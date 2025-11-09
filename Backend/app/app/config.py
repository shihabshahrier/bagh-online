"""Configuration helpers for the Bagh Online API backend."""

from __future__ import annotations

from typing import Sequence

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class APISettings(BaseSettings):
    """Application configuration sourced from environment variables."""

    app_name: str = "Bagh Lang Cloud"
    app_version: str = "0.1.0"
    api_prefix: str = "/api"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    api_host: str = Field(default="0.0.0.0", alias="BAGH_API_HOST")
    api_port: int = Field(default=8000, ge=1, le=65535, alias="BAGH_API_PORT")

    cors_allow_origins: str | Sequence[str] = Field(
        default_factory=lambda: ("http://localhost:5173", "http://127.0.0.1:5173"),
        alias="CORS_ALLOW_ORIGINS",
    )
    cors_allow_credentials: bool = True

    sandbox_timeout_seconds: float = Field(
        default=3.0,
        alias="BAGH_SANDBOX_TIMEOUT",
        ge=0.1,
        le=30.0,
    )
    sandbox_max_source_chars: int = Field(
        default=6000,
        alias="BAGH_SANDBOX_MAX_SOURCE",
        ge=1,
        le=20000,
    )
    sandbox_max_output_chars: int = Field(
        default=5000,
        alias="BAGH_SANDBOX_MAX_OUTPUT",
        ge=200,
        le=20000,
    )
    sandbox_max_concurrency: int = Field(
        default=4,
        alias="BAGH_SANDBOX_MAX_CONCURRENCY",
        ge=1,
        le=32,
    )

    gemini_api_key: str | None = Field(default=None, alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-pro", alias="GEMINI_MODEL")
    gemini_temperature: float = Field(default=0.4, alias="GEMINI_TEMPERATURE")
    gemini_top_p: float = Field(default=0.9, alias="GEMINI_TOP_P")
    gemini_top_k: int = Field(default=40, alias="GEMINI_TOP_K")
    gemini_max_output_tokens: int = Field(
        default=512,
        alias="GEMINI_MAX_OUTPUT_TOKENS",
        ge=64,
        le=2048,
    )

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_allow_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: Sequence[str] | str) -> Sequence[str]:
        if isinstance(value, str):
            if not value:
                return ()
            return tuple(origin.strip() for origin in value.split(",") if origin.strip())
        return tuple(value)


__all__ = ["APISettings"]
