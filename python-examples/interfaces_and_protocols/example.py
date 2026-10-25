"""Interfaces with typing.Protocol: classes qualify by shape, not by inheritance."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Protocol, runtime_checkable


class Readable(Protocol):
    def get(self, key: str) -> str | None: ...


class Writable(Protocol):
    def put(self, key: str, value: str) -> None: ...


@runtime_checkable
class Store(Readable, Writable, Protocol):
    pass


class MemoryStore:  # no base class: it matches Store by shape
    def __init__(self) -> None:
        self._data: dict[str, str] = {}

    def get(self, key: str) -> str | None:
        return self._data.get(key)

    def put(self, key: str, value: str) -> None:
        self._data[key] = value


class ReadOnlyConfig:  # only matches Readable
    def __init__(self, data: Mapping[str, str]) -> None:
        self._data = dict(data)

    def get(self, key: str) -> str | None:
        return self._data.get(key)


def remember_login(store: Writable, user: str) -> None:
    store.put(f"login:{user}", "yes")


def is_logged_in(store: Readable, user: str) -> bool:
    return store.get(f"login:{user}") == "yes"


def main() -> None:
    memory = MemoryStore()
    remember_login(memory, "ana")
    print(f"ana logged in: {is_logged_in(memory, 'ana')}")

    config = ReadOnlyConfig({"login:ben": "yes"})
    print(f"ben logged in (read-only source): {is_logged_in(config, 'ben')}")

    print(f"MemoryStore is a Store: {isinstance(memory, Store)}")
    print(f"ReadOnlyConfig is a Store: {isinstance(config, Store)}")


if __name__ == "__main__":
    main()

# Expected output:
# ana logged in: True
# ben logged in (read-only source): True
# MemoryStore is a Store: True
# ReadOnlyConfig is a Store: False
