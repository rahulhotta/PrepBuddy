"""Singleton: one shared feature-flag store, plus the Pythonic alternatives."""

from __future__ import annotations

import threading
from dataclasses import dataclass
from functools import cache
from typing import ClassVar


class FeatureFlags:
    """Classic Singleton: every FeatureFlags() call returns the same instance."""

    _instance: ClassVar[FeatureFlags | None] = None
    _lock: ClassVar[threading.Lock] = threading.Lock()
    _flags: dict[str, bool]

    def __new__(cls) -> FeatureFlags:
        if cls._instance is None:
            with cls._lock:
                # Checked again inside the lock: another thread may have created it while we waited.
                if cls._instance is None:
                    instance = super().__new__(cls)
                    instance._flags = {}
                    cls._instance = instance
        return cls._instance

    # No __init__: it would run on every FeatureFlags() call and wipe the shared state.

    def enable(self, name: str) -> None:
        self._flags[name] = True

    def is_enabled(self, name: str) -> bool:
        return self._flags.get(name, False)

    @classmethod
    def reset_for_tests(cls) -> None:
        cls._instance = None


# Pythonic alternative 1: a cached factory function. The first call builds it; later calls reuse it.
@dataclass(frozen=True)
class Settings:
    region: str
    max_upload_mb: int


@cache
def get_settings() -> Settings:
    print("loading settings")
    return Settings(region="eu-west", max_upload_mb=25)


# Pythonic alternative 2 lives in any module: `settings = Settings(...)` at module level is
# created once on first import and shared by every importer.


# Preferred in application code: depend on the object, and let the caller decide how many exist.
@dataclass
class UploadService:
    settings: Settings

    def accepts(self, size_mb: int) -> bool:
        return size_mb <= self.settings.max_upload_mb


def main() -> None:
    a = FeatureFlags()
    b = FeatureFlags()
    a.enable("dark_mode")
    print(f"same object: {a is b}")
    print(f"b sees dark_mode: {b.is_enabled('dark_mode')}")

    first = get_settings()
    second = get_settings()
    print(f"cached settings shared: {first is second}")

    service = UploadService(get_settings())
    print(f"accepts 20 MB: {service.accepts(20)}")
    test_service = UploadService(Settings(region="test", max_upload_mb=1))
    print(f"test double accepts 20 MB: {test_service.accepts(20)}")


if __name__ == "__main__":
    main()

# Expected output:
# same object: True
# b sees dark_mode: True
# loading settings
# cached settings shared: True
# accepts 20 MB: True
# test double accepts 20 MB: False
