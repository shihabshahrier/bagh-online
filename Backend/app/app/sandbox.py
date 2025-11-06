"""Process-isolated execution sandbox for Bagh Lang programs."""

from __future__ import annotations

import asyncio
import builtins
import io
import math
import multiprocessing as mp
import queue
import sys
import time
import time as time_module
import traceback
from contextlib import redirect_stderr, redirect_stdout
from dataclasses import dataclass, field
from types import MappingProxyType
from typing import Any, Dict, Mapping, NamedTuple

from bagh_lang.runtime import BaghRuntimeError
from bagh_lang.syntax import validate_python_syntax
from bagh_lang.translator import translate_bagh_to_python


class SandboxError(RuntimeError):
    """Raised when the sandbox cannot execute the program."""


class SandboxTimeout(SandboxError):
    """Raised when execution exceeds the configured timeout."""


class SandboxResult(NamedTuple):
    translated: str
    stdout: str
    stderr: str | None
    duration_ms: float
    status: str


SAFE_BUILTINS: Mapping[str, object] = MappingProxyType(
    {
        "abs": abs,
        "all": all,
        "any": any,
        "enumerate": enumerate,
        "filter": filter,
        "len": len,
        "map": map,
        "max": max,
        "min": min,
        "range": range,
        "reversed": reversed,
        "round": round,
        "sorted": sorted,
        "sum": sum,
        "zip": zip,
        "bool": bool,
        "int": int,
        "float": float,
        "str": str,
        "list": list,
        "dict": dict,
        "set": set,
        "tuple": tuple,
        "print": print,
        "__build_class__": builtins.__build_class__,
        "Exception": Exception,
        "ValueError": ValueError,
        "TypeError": TypeError,
        "KeyError": KeyError,
        "IndexError": IndexError,
        "NameError": NameError,
    }
)

ALLOWED_IMPORTS = {"math", "time"}


def _limited_import(name, globals=None, locals=None, fromlist=(), level=0):
    if name in ALLOWED_IMPORTS:
        return builtins.__import__(name, globals, locals, fromlist, level)
    raise ImportError(f"Module '{name}' is not permitted in the sandbox.")


def _sandbox_worker(
    source: str,
    filename: str,
    output_queue: "mp.Queue[dict[str, object]]",
    max_output_chars: int,
) -> None:
    started = time.perf_counter()
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    translated = ""

    try:
        translated = translate_bagh_to_python(source)
        validate_python_syntax(translated, filename=filename)

        safe_globals: Dict[str, object] = {
            "__builtins__": dict(SAFE_BUILTINS, __import__=_limited_import),
            "math": math,
            "time": time_module,
        }

        with redirect_stdout(stdout_buffer), redirect_stderr(stderr_buffer):
            exec(compile(translated, filename, "exec"), safe_globals, {})

        stdout_value = stdout_buffer.getvalue()[:max_output_chars]
        stderr_value = stderr_buffer.getvalue()[:max_output_chars]

        output_queue.put(
            {
                "status": "success",
                "translated": translated,
                "stdout": stdout_value,
                "stderr": stderr_value or None,
                "duration_ms": (time.perf_counter() - started) * 1000,
            }
        )
    except Exception as exc:  # pragma: no cover
        stdout_value = stdout_buffer.getvalue()[:max_output_chars]
        stderr_value = stderr_buffer.getvalue()[:max_output_chars]
        tb = traceback.format_exc(limit=5)
        output_queue.put(
            {
                "status": "error",
                "translated": translated,
                "stdout": stdout_value,
                "stderr": (stderr_value + "\n" + tb).strip() if tb else stderr_value,
                "error": str(exc),
                "duration_ms": (time.perf_counter() - started) * 1000,
            }
        )


@dataclass(slots=True)
class SandboxExecutor:
    timeout_seconds: float
    max_concurrency: int
    max_output_chars: int
    _ctx: Any = field(default=None, init=False, repr=False)
    _semaphore: Any = field(default=None, init=False, repr=False)

    def __post_init__(self) -> None:
        object.__setattr__(self, '_ctx', mp.get_context("spawn"))
        object.__setattr__(self, '_semaphore', asyncio.Semaphore(self.max_concurrency))

    async def run(
        self,
        source: str,
        *,
        filename: str = "<api>",
        max_source_chars: int,
    ) -> SandboxResult:
        if len(source) > max_source_chars:
            raise BaghRuntimeError(
                f"Program length {len(source)} exceeds limit of {max_source_chars} characters."
            )

        async with self._semaphore:
            return await asyncio.to_thread(
                self._run_sync, source, filename, max_source_chars
            )

    def _run_sync(
        self,
        source: str,
        filename: str,
        max_source_chars: int,
    ) -> SandboxResult:
        queue_: "mp.Queue[dict[str, object]]" = self._ctx.Queue()
        process = self._ctx.Process(
            target=_sandbox_worker,
            args=(source, filename, queue_, self.max_output_chars),
        )
        process.start()

        try:
            try:
                result = queue_.get(timeout=self.timeout_seconds)
            except queue.Empty as exc:
                _terminate_process(process)
                raise SandboxTimeout(
                    f"Execution exceeded {self.timeout_seconds:.1f}s timeout."
                ) from exc
            finally:
                process.join(timeout=0.1)
                if process.is_alive():
                    _terminate_process(process)

            status = result.get("status", "error")
            return SandboxResult(
                translated=result.get("translated", ""),
                stdout=result.get("stdout", "") or "",
                stderr=result.get("stderr"),
                duration_ms=float(result.get("duration_ms", 0.0)),
                status=status,
            )
        finally:
            queue_.close()
            queue_.join_thread()
            if hasattr(process, "close"):
                process.close()


def _terminate_process(process: mp.Process) -> None:
    try:
        if sys.platform != "win32":
            process.kill()
        else:  # pragma: no cover - Windows fallback
            process.terminate()
        process.join(timeout=0.1)
    except Exception:
        process.close()


__all__ = [
    "SandboxExecutor",
    "SandboxError",
    "SandboxResult",
    "SandboxTimeout",
]
