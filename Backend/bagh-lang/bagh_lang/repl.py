"""Interactive shell for Bagh Lang."""

from __future__ import annotations

from .resources import iter_branding_banner
from .runtime import BaghRuntimeError, run_bagh_code


def start_repl() -> None:
    for line in iter_branding_banner():
        print(line)
    scope: dict[str, object] = {}

    while True:
        try:
            line = input(">>> ")
        except EOFError:
            print()
            break

        if not line.strip():
            continue

        if line.strip() in {"exit", "quit"}:
            break

        try:
            run_bagh_code(line, filename="<repl>", globals_ctx=scope, locals_ctx=scope)
        except BaghRuntimeError as err:
            print(err)
