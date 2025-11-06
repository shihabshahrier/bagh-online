"""FastAPI application factory for the Bagh Online backend.

This module sets up a stateless FastAPI service for running Bagh Lang code,
translating to Python, and providing Gemini-powered assistance.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime
from importlib import resources
from pathlib import Path
from typing import Callable

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from . import get_settings
from .ai import GeminiClient, GeminiUnavailable
from .config import APISettings
from .models import (
    AssistRequest,
    AssistResponse,
    ErrorResponse,
    ExecutionRequest,
    ExecutionResponse,
    TranslationRequest,
    TranslationResponse,
)
from .sandbox import SandboxError, SandboxExecutor, SandboxResult, SandboxTimeout
from bagh_lang.syntax import SyntaxValidationError, validate_python_syntax
from bagh_lang.translator import translate_bagh_to_python

logger = logging.getLogger("bagh_online.api")


def _load_bagh_context() -> str:
    """Load the Bagh Lang context file for Gemini prompts."""
    context_path = Path(__file__).parent.parent / "context" / "gemini_bagh_context.txt"
    if context_path.exists():
        return context_path.read_text(encoding="utf-8")
    logger.warning("Bagh context file not found at %s", context_path)
    return ""


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    configure_logging(settings)
    bagh_context = _load_bagh_context()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Bagh Lang Cloud - Learn Bengali-first programming",
        default_response_class=JSONResponse,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_allow_origins),
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount static assets (logo, etc.)
    try:
        assets_dir = resources.files("bagh_lang").joinpath("assets")
        if assets_dir.is_dir():
            app.mount(
                f"{settings.api_prefix}/assets",
                StaticFiles(directory=str(assets_dir)),
                name="assets",
            )
    except (ModuleNotFoundError, TypeError):
        logger.warning("bagh_lang assets not available; skipping static mount.")

    # Initialize services
    sandbox = SandboxExecutor(
        timeout_seconds=settings.sandbox_timeout_seconds,
        max_concurrency=settings.sandbox_max_concurrency,
        max_output_chars=settings.sandbox_max_output_chars,
    )
    gemini_client = GeminiClient(settings, context=bagh_context)

    @app.middleware("http")
    async def add_request_id(request: Request, call_next: Callable):
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response

    @app.exception_handler(SandboxTimeout)
    async def sandbox_timeout_handler(request: Request, exc: SandboxTimeout):
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        return JSONResponse(
            status_code=504,
            content=ErrorResponse(
                request_id=request_id,
                error="Execution timeout",
                detail=str(exc),
            ).model_dump(mode='json'),
        )

    @app.exception_handler(SandboxError)
    async def sandbox_error_handler(request: Request, exc: SandboxError):
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(
                request_id=request_id,
                error="Sandbox error",
                detail=str(exc),
            ).model_dump(mode='json'),
        )

    @app.exception_handler(GeminiUnavailable)
    async def gemini_unavailable_handler(request: Request, exc: GeminiUnavailable):
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        return JSONResponse(
            status_code=424,
            content=ErrorResponse(
                request_id=request_id,
                error="Gemini unavailable",
                detail=str(exc),
            ).model_dump(mode='json'),
        )

    @app.exception_handler(SyntaxValidationError)
    async def syntax_error_handler(request: Request, exc: SyntaxValidationError):
        request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
        return JSONResponse(
            status_code=422,
            content=ErrorResponse(
                request_id=request_id,
                error="Syntax error",
                detail=str(exc),
            ).model_dump(mode='json'),
        )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat(),
            "environment": settings.environment,
        }

    @app.post(
        f"{settings.api_prefix}/v1/translate",
        response_model=TranslationResponse,
    )
    async def translate(
        payload: TranslationRequest,
        request: Request,
        api_settings: APISettings = Depends(get_settings),
    ) -> TranslationResponse:
        request_id = request.state.request_id
        source = payload.source.strip()
        if not source:
            raise HTTPException(status_code=400, detail="Source code cannot be empty.")

        if len(source) > api_settings.sandbox_max_source_chars:
            raise HTTPException(
                status_code=413,
                detail=(
                    f"Program length exceeds limit of "
                    f"{api_settings.sandbox_max_source_chars} characters."
                ),
            )

        start = datetime.utcnow()
        translated = translate_bagh_to_python(source)
        validate_python_syntax(translated, filename=payload.filename or "<api>")

        return TranslationResponse(
            request_id=request_id,
            translated=translated,
            duration_ms=float((datetime.utcnow() - start).total_seconds() * 1000),
            source_char_length=len(source),
        )

    @app.post(
        f"{settings.api_prefix}/v1/execute",
        response_model=ExecutionResponse,
    )
    async def execute(
        payload: ExecutionRequest,
        request: Request,
        api_settings: APISettings = Depends(get_settings),
    ):
        request_id = request.state.request_id
        source = payload.source.strip()
        if not source:
            raise HTTPException(status_code=400, detail="Source code cannot be empty.")

        result: SandboxResult = await sandbox.run(
            source,
            filename=payload.filename or "<api>",
            max_source_chars=api_settings.sandbox_max_source_chars,
        )

        response_payload = ExecutionResponse(
            request_id=request_id,
            translated=result.translated,
            stdout=result.stdout,
            stderr=result.stderr,
            duration_ms=result.duration_ms,
            status=result.status if result.status != "success" else "success",
        )
        if result.status != "success":
            logger.warning(
                "Bagh execution error: stderr=%s", (result.stderr or "")[:200]
            )
            return JSONResponse(
                status_code=400,
                content=response_payload.model_dump(mode='json'),
            )

        return response_payload

    @app.post(
        f"{settings.api_prefix}/v1/assist",
        response_model=AssistResponse,
    )
    async def assist(payload: AssistRequest, request: Request) -> AssistResponse:
        request_id = request.state.request_id
        message = await gemini_client.generate(
            payload.prompt,
            context=payload.context,
        )
        return AssistResponse(
            request_id=request_id,
            message=message,
            model=settings.gemini_model if gemini_client.available else None,
        )

    return app


def run() -> None:
    try:
        import uvicorn
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError(
            "uvicorn is required to run the API. Install bagh-online-app dependencies."
        ) from exc

    settings = get_settings()
    uvicorn.run(
        "app.main:create_app",
        factory=True,
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower(),
    )


def configure_logging(settings: APISettings) -> None:
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


__all__ = ["create_app", "run", "app"]


# Create a module-level app instance for uvicorn
app = create_app()
