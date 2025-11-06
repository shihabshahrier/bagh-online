"""Optional Gemini integration for Bagh Online."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from typing import Any, Optional

from tenacity import (
    AsyncRetrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_random_exponential,
)

from .config import APISettings

logger = logging.getLogger(__name__)

try:  # pragma: no cover - optional dependency
    import google.generativeai as genai
except Exception:  # pragma: no cover - optional dependency
    genai = None


class GeminiUnavailable(RuntimeError):
    """Raised when Gemini support is disabled or misconfigured."""


@dataclass(slots=True)
class GeminiClient:
    settings: APISettings
    context: str = ""
    _model: Any = field(default=None, init=False, repr=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, '_model', None)
        if self.settings.gemini_api_key and genai is not None:
            genai.configure(api_key=self.settings.gemini_api_key)
            try:
                object.__setattr__(self, '_model', genai.GenerativeModel(self.settings.gemini_model))
            except Exception as exc:  # pragma: no cover - SDK failure
                logger.warning("Failed to initialize Gemini model: %s", exc)
                object.__setattr__(self, '_model', None)
        elif self.settings.gemini_api_key and genai is None:
            logger.warning(
                "google-generativeai package not installed; Gemini support disabled."
            )

    @property
    def available(self) -> bool:
        return self._model is not None

    async def generate(self, prompt: str, *, context: Optional[str] = None) -> str:
        if not self.available:
            raise GeminiUnavailable(
                "Gemini client unavailable. Install google-generativeai and supply GEMINI_API_KEY."
            )

        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(3),
            wait=wait_random_exponential(multiplier=0.5, max=4.0),
            retry=retry_if_exception_type(Exception),
            reraise=True,
        ):
            with attempt:
                return await asyncio.to_thread(
                    self._generate_content_sync, prompt, context
                )

    def _generate_content_sync(self, prompt: str, context: Optional[str]) -> str:
        try:
            parts = [prompt]
            if context:
                parts.append(f"\n\nCode context:\n{context}")
            
            # Add system context about Bagh Lang if available
            if self.context:
                parts.insert(0, f"Background:\n{self.context}\n---\n")

            response = self._model.generate_content(
                "\n".join(parts),
                generation_config={
                    "temperature": self.settings.gemini_temperature,
                    "top_p": self.settings.gemini_top_p,
                    "top_k": self.settings.gemini_top_k,
                    "max_output_tokens": self.settings.gemini_max_output_tokens,
                },
            )

            if getattr(response, "text", None):
                return response.text

            candidates = getattr(response, "candidates", None)
            if candidates:
                for candidate in candidates:
                    content = getattr(candidate, "content", None)
                    if content and getattr(content, "parts", None):
                        texts = [getattr(part, "text", "") for part in content.parts]
                        return "\n".join(filter(None, texts)).strip()
            return "Gemini উত্তর প্রদান করতে পারেনি।"
        except Exception as exc:  # pragma: no cover - SDK failure
            logger.error("Gemini generate_content failed: %s", exc)
            raise


__all__ = ["GeminiClient", "GeminiUnavailable"]
