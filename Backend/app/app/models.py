"""Pydantic models exposed by the Bagh Online API."""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class BaseResponse(BaseModel):
    request_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TranslationRequest(BaseModel):
    source: str = Field(min_length=1, description="Bagh Lang source to translate.")
    filename: str | None = Field(
        default=None,
        description="Optional filename metadata for diagnostics.",
    )


class TranslationResponse(BaseResponse):
    translated: str
    duration_ms: float
    source_char_length: int


class ExecutionRequest(BaseModel):
    source: str = Field(min_length=1, description="Bagh Lang source to execute.")
    filename: str | None = Field(default=None)
    stream_output: bool = Field(
        default=False,
        description="Reserved for future streaming support.",
    )


class ExecutionResponse(BaseResponse):
    translated: str
    stdout: str
    stderr: str | None
    duration_ms: float
    status: Literal["success", "timeout", "error"]


class AssistRequest(BaseModel):
    prompt: str = Field(min_length=1, description="User prompt for Gemini.")
    context: Optional[str] = Field(
        default=None,
        description="Optional source/context for grounding Gemini responses.",
    )


class AssistResponse(BaseResponse):
    message: str
    model: str | None


class ErrorResponse(BaseResponse):
    error: str
    detail: str | None = None


__all__ = [
    "AssistRequest",
    "AssistResponse",
    "ErrorResponse",
    "ExecutionRequest",
    "ExecutionResponse",
    "TranslationRequest",
    "TranslationResponse",
]
