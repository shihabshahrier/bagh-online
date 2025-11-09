"""Utilities for accessing packaged resources such as the logo image."""

from __future__ import annotations

from contextlib import contextmanager
from importlib import resources
from pathlib import Path
from typing import Iterator

from . import __version__
from .art import ASCII_LOGO
from .assets import LOGO_FILENAME

__all__ = [
    "ASCII_LOGO",
    "get_logo_path",
    "open_logo_bytes",
    "iter_branding_banner",
]


def get_logo_path() -> str:
    """Return a filesystem path to the packaged logo image."""
    with resources.as_file(_logo_resource()) as path:
        return str(path)


def open_logo_bytes() -> bytes:
    """Return the raw bytes of the packaged logo image."""
    return _logo_resource().read_bytes()


@contextmanager
def logo_file() -> Iterator[Path]:
    """Context manager yielding a pathlib.Path to the logo image."""
    with resources.as_file(_logo_resource()) as path:
        yield path


def iter_branding_banner() -> Iterator[str]:
    """Yield lines composing the standard Bagh Lang banner."""
    yield ASCII_LOGO
    yield f"🐯  Bagh Lang v{__version__}"
    yield f"Logo: {get_logo_path()}"


def _logo_resource() -> resources.abc.Traversable:
    return resources.files("bagh_lang.assets").joinpath(LOGO_FILENAME)
