"""Exceptions: a small domain hierarchy, translation, chaining and rollback."""

from __future__ import annotations

from collections.abc import Mapping


class InventoryError(Exception):
    """Base for every inventory failure; callers can catch this to handle them all."""


class UnknownSku(InventoryError):
    def __init__(self, sku: str) -> None:
        super().__init__(f"unknown SKU {sku!r}")
        self.sku = sku


class OutOfStock(InventoryError):
    def __init__(self, sku: str, requested: int, available: int) -> None:
        super().__init__(f"{sku}: requested {requested}, only {available} left")
        self.sku, self.requested, self.available = sku, requested, available


class InvalidQuantity(InventoryError):
    pass


class Inventory:
    def __init__(self, stock: Mapping[str, int]) -> None:
        self.stock = dict(stock)

    def reserve(self, sku: str, quantity: int) -> None:
        if quantity <= 0:
            raise ValueError("quantity must be positive")  # caller misuse, not a domain failure
        try:
            available = self.stock[sku]
        except KeyError:
            raise UnknownSku(sku) from None
        if quantity > available:
            raise OutOfStock(sku, quantity, available)
        self.stock[sku] = available - quantity

    def release(self, sku: str, quantity: int) -> None:
        self.stock[sku] += quantity


def place_order(inventory: Inventory, items: Mapping[str, int]) -> str:
    reserved: list[tuple[str, int]] = []
    try:
        for sku, quantity in items.items():
            inventory.reserve(sku, quantity)
            reserved.append((sku, quantity))
    except InventoryError as exc:
        for sku, quantity in reversed(reserved):
            inventory.release(sku, quantity)  # never leave stock half-reserved
        return f"failed: {exc}"
    else:
        return "placed"


def parse_quantity(text: str) -> int:
    try:
        return int(text)
    except ValueError as exc:
        raise InvalidQuantity(f"not a number: {text!r}") from exc


def main() -> None:
    inventory = Inventory({"pen": 5, "ink": 1})
    print(place_order(inventory, {"pen": 2, "ink": 1}))
    print(place_order(inventory, {"pen": 1, "ink": 1}))
    print(f"stock after rollback: {inventory.stock}")
    print(place_order(inventory, {"cap": 1}))

    try:
        inventory.reserve("pen", 0)
    except ValueError as exc:
        print(f"bad input: {exc}")

    try:
        parse_quantity("ten")
    except InvalidQuantity as exc:
        print(f"{exc} (caused by {type(exc.__cause__).__name__})")


if __name__ == "__main__":
    main()

# Expected output:
# placed
# failed: ink: requested 1, only 0 left
# stock after rollback: {'pen': 3, 'ink': 0}
# failed: unknown SKU 'cap'
# bad input: quantity must be positive
# not a number: 'ten' (caused by ValueError)
