"""Properties, enums and dataclasses in one small order model."""

from __future__ import annotations

from dataclasses import FrozenInstanceError, dataclass, field
from decimal import Decimal
from enum import Enum, auto


class OrderStatus(Enum):
    PENDING = auto()
    PAID = auto()
    SHIPPED = auto()
    CANCELLED = auto()


ALLOWED: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: set(),
    OrderStatus.CANCELLED: set(),
}


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "EUR"

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError("amount cannot be negative")

    def __add__(self, other: Money) -> Money:
        if other.currency != self.currency:
            raise ValueError("currency mismatch")
        return Money(self.amount + other.amount, self.currency)

    def __str__(self) -> str:
        return f"{self.amount} {self.currency}"


@dataclass
class Order:
    id: str
    lines: list[Money] = field(default_factory=list)
    _status: OrderStatus = field(default=OrderStatus.PENDING, init=False, repr=False)

    @property
    def total(self) -> Money:
        result = Money(Decimal("0.00"))
        for line in self.lines:
            result = result + line
        return result

    @property
    def status(self) -> OrderStatus:
        return self._status

    @status.setter
    def status(self, new: OrderStatus) -> None:
        if new not in ALLOWED[self._status]:
            raise ValueError(f"cannot go from {self._status.name} to {new.name}")
        self._status = new


def main() -> None:
    order = Order("A1", [Money(Decimal("10.00")), Money(Decimal("2.50"))])
    print(f"total: {order.total}")

    order.status = OrderStatus.PAID
    print(f"status: {order.status.name}")
    try:
        order.status = OrderStatus.PENDING
    except ValueError as exc:
        print(f"rejected: {exc}")

    price = Money(Decimal("1"))
    try:
        price.amount = Decimal("5")  # type: ignore[misc]
    except FrozenInstanceError:
        print("Money is immutable")

    print(f"value equality: {Money(Decimal('1.0')) == Money(Decimal('1.00'))}")
    print("states: " + ", ".join(s.name for s in OrderStatus))


if __name__ == "__main__":
    main()

# Expected output:
# total: 12.50 EUR
# status: PAID
# rejected: cannot go from PAID to PENDING
# Money is immutable
# value equality: True
# states: PENDING, PAID, SHIPPED, CANCELLED
