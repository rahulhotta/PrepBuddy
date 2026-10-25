"""Type hints and generics: one typed repository for many entity types."""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from typing import Protocol


class HasId(Protocol):
    @property
    def id(self) -> str: ...


@dataclass(frozen=True)
class User:
    id: str
    name: str


@dataclass(frozen=True)
class Product:
    id: str
    price: int


class Repository[T: HasId]:
    def __init__(self) -> None:
        self._items: dict[str, T] = {}

    def add(self, item: T) -> None:
        self._items[item.id] = item

    def get(self, item_id: str) -> T | None:
        return self._items.get(item_id)

    def all(self) -> list[T]:
        return list(self._items.values())


def first[T](items: Sequence[T]) -> T | None:
    return items[0] if items else None


type Pair[K, V] = tuple[K, V]


def swap[K, V](pair: Pair[K, V]) -> Pair[V, K]:
    return pair[1], pair[0]


def cheapest(products: Iterable[Product]) -> Product | None:
    return min(products, key=lambda p: p.price, default=None)


def double(n: int) -> int:
    return n * 2


def main() -> None:
    users = Repository[User]()
    users.add(User("u1", "Ana"))
    print(users.get("u1"))

    products = Repository[Product]()
    products.add(Product("p1", 8))
    products.add(Product("p2", 3))
    print(f"cheapest: {cheapest(products.all())}")

    print(f"first: {first(['x', 'y'])}, empty: {first([])}")
    print(f"swap: {swap(('a', 1))}")
    print(f"runtime ignores hints: {double('ab')!r}")  # type: ignore[arg-type]


if __name__ == "__main__":
    main()

# Expected output:
# User(id='u1', name='Ana')
# cheapest: Product(id='p2', price=3)
# first: x, empty: None
# swap: (1, 'a')
# runtime ignores hints: 'abab'
