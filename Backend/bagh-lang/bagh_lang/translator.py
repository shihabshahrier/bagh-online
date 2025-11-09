"""Source translation utilities for Bagh Lang."""

from __future__ import annotations

import re
from typing import Dict, List, Tuple

from .keywords import bangla_numerals, bangla_to_python

_TOKEN_CHAR_CLASS = r"\w\u0980-\u09FF_"


def _build_token_regex(mapping: Dict[str, str]) -> re.Pattern[str]:
    escaped = sorted((re.escape(k) for k in mapping.keys()), key=len, reverse=True)
    pattern = rf"(?<![{_TOKEN_CHAR_CLASS}])({'|'.join(escaped)})(?![{_TOKEN_CHAR_CLASS}])"
    return re.compile(pattern)


_TOKEN_REGEX = _build_token_regex(bangla_to_python)
_NUMERAL_TRANS = str.maketrans(bangla_numerals)
_FOR_RANGE_PATTERN = re.compile(
    r"for\s+(?P<var>[^\s:]+)\s+(?P<count>[^:\n]+?)\s+in range\s*:",
    flags=re.UNICODE,
)


def translate_bagh_to_python(source: str) -> str:
    """Translate a Bagh Lang source string into executable Python code."""
    segments = _split_source_segments(source)
    translated_parts: List[str] = []

    for kind, chunk in segments:
        if kind == "code":
            normalized = chunk.translate(_NUMERAL_TRANS)
            translated_chunk = _TOKEN_REGEX.sub(_token_replacer, normalized)
            translated_parts.append(translated_chunk)
        else:
            translated_parts.append(chunk)

    combined = "".join(translated_parts)
    return _normalize_range_loops(combined)


def _token_replacer(match: re.Match[str]) -> str:
    token = match.group(0)
    return bangla_to_python.get(token, token)


def _split_source_segments(source: str) -> List[Tuple[str, str]]:
    """Split source into (kind, segment) pairs, separating string literals."""
    segments: List[Tuple[str, str]] = []
    length = len(source)
    i = 0
    start = 0

    while i < length:
        ch = source[i]
        if ch in {"'", '"'}:
            # Determine if this is a triple-quoted string.
            triple = source[i : i + 3] == ch * 3
            quote_len = 3 if triple else 1
            j = i + quote_len

            while j < length:
                if source[j] == "\\":
                    j += 2
                    continue
                if triple:
                    if source[j : j + 3] == ch * 3:
                        j += 3
                        break
                else:
                    if source[j] == ch:
                        j += 1
                        break
                j += 1

            if j > length:
                j = length

            if start < i:
                segments.append(("code", source[start:i]))
            segments.append(("string", source[i:j]))
            i = j
            start = i
        else:
            i += 1

    if start < length:
        segments.append(("code", source[start:]))

    return segments


def _normalize_range_loops(code: str) -> str:
    """Normalize `for` loops that use the Bagh `বার` helper."""

    def _repl(match: re.Match[str]) -> str:
        var = match.group("var")
        count = match.group("count").strip()
        return f"for {var} in range({count}):"

    return _FOR_RANGE_PATTERN.sub(_repl, code)
