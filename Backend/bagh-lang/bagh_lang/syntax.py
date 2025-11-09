"""Syntax validation helpers for Bagh Lang."""

from __future__ import annotations

import ast
from typing import Optional

try:  # pragma: no cover - optional dependency
    from lark import Lark
except Exception:  # pragma: no cover - optional dependency
    Lark = None


class SyntaxValidationError(Exception):
    """Raised when translated Python source fails validation."""


_LARK_PARSER: Optional["Lark"] = None
if Lark is not None:  # pragma: no cover - optional dependency
    try:
        _LARK_PARSER = Lark.open_from_package(
            "lark",
            "python.lark",
            search_paths=("grammars",),
            parser="lalr",
            maybe_placeholders=True,
        )
    except Exception:
        _LARK_PARSER = None


def validate_python_syntax(source: str, *, filename: str = "<bagh>") -> None:
    """Validate translated Python using Lark when available, otherwise ast.parse."""
    if _LARK_PARSER is not None:
        try:
            _LARK_PARSER.parse(source)
            return
        except Exception as exc:  # pragma: no cover - optional dependency
            raise SyntaxValidationError(f"সিনট্যাক্স ত্রুটি: {exc}") from exc

    try:
        ast.parse(source, filename=filename, mode="exec")
    except SyntaxError as exc:
        message = f"সিনট্যাক্স ত্রুটি: {exc.msg} (লাইন {exc.lineno})"
        raise SyntaxValidationError(message) from exc
