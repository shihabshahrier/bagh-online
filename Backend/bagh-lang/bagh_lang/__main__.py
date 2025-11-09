"""Entry point for `python -m bagh_lang`."""

from .cli import main


if __name__ == "__main__":  # pragma: no cover - module launcher
    raise SystemExit(main())
