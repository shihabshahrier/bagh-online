"""Command-line interface for Bagh Lang."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Iterable, Optional

from . import runtime
from .resources import iter_branding_banner
from .repl import start_repl


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="bagh", description="Bagh Lang CLI")
    parser.add_argument(
        "target",
        nargs="?",
        help="Path to a .bg source file or commands: 'repl', 'logo'.",
    )
    parser.add_argument(
        "--dump-python",
        action="store_true",
        help="Print the translated Python source before execution.",
    )
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_parser()
    argv_list = list(argv) if argv is not None else None
    parser_method = getattr(parser, "parse_known_intermixed_args", None)
    if parser_method is not None:
        args, extras = parser_method(argv_list)
    else:  # pragma: no cover - fallback for older Python
        args, extras = parser.parse_known_args(argv_list)

    if args.target == "repl":
        if extras:
            parser.error("unexpected additional arguments for repl")
        start_repl()
        return 0

    if args.target == "logo":
        if extras:
            parser.error("unexpected additional arguments for logo")
        for line in iter_branding_banner():
            print(line)
        return 0

    if not args.target:
        parser.print_help()
        return 1

    if extras:
        parser.error(f"unexpected arguments: {' '.join(extras)}")

    file_path = Path(args.target)
    if not file_path.exists():
        parser.error(f"ফাইল পাওয়া যায়নি: {file_path}")

    result = runtime.run_bagh_file(file_path)
    if args.dump_python:
        print(result.translated)
    return 0


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    sys.exit(main())
