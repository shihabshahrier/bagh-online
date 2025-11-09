"""Execution runtime for Bagh Lang."""

from __future__ import annotations

import math
import time
from dataclasses import dataclass
from pathlib import Path
from types import MappingProxyType
from typing import Dict, Optional

from .translator import translate_bagh_to_python
from .syntax import SyntaxValidationError, validate_python_syntax


class BaghRuntimeError(RuntimeError):
    """Raised when executing translated Bagh code fails."""


DEFAULT_GLOBALS: Dict[str, object] = {
    "__builtins__": __builtins__,
    "math": math,
    "time": time,
    "str": str,
}
DEFAULT_GLOBALS = dict(DEFAULT_GLOBALS)  # ensure mutability copy for downstream use


@dataclass(frozen=True)
class ExecutionResult:
    source: str
    translated: str

    def to_mapping(self) -> MappingProxyType:
        return MappingProxyType({"source": self.source, "translated": self.translated})


def run_bagh_code(
    code: str,
    *,
    filename: str = "<bagh>",
    globals_ctx: Optional[Dict[str, object]] = None,
    locals_ctx: Optional[Dict[str, object]] = None,
) -> ExecutionResult:
    """Translate and execute the provided Bagh source string."""
    translated = translate_bagh_to_python(code)
    globals_frame = DEFAULT_GLOBALS.copy()
    if globals_ctx:
        globals_frame.update(globals_ctx)

    try:
        validate_python_syntax(translated, filename=filename)
        exec(compile(translated, filename, "exec"), globals_frame, locals_ctx)
    except SyntaxValidationError as exc:
        raise BaghRuntimeError(str(exc)) from exc
    except Exception as exc:  # pragma: no cover - runtime guard
        message = f"ত্রুটি: {exc.__class__.__name__}: {exc}"
        raise BaghRuntimeError(message) from exc

    return ExecutionResult(source=code, translated=translated)


def run_bagh_file(path: str | Path) -> ExecutionResult:
    """Read, translate, and execute a .bg file."""
    file_path = Path(path)
    code = file_path.read_text(encoding="utf-8")
    return run_bagh_code(code, filename=str(file_path))
