"""Abstraction with an ABC: checkout depends on PaymentMethod, not on any specific payment."""

from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal


class PaymentMethod(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def authorize(self, amount: Decimal) -> bool: ...

    def pay(self, amount: Decimal) -> str:
        """Concrete workflow shared by every payment method."""
        if amount <= 0:
            raise ValueError("amount must be positive")
        status = "approved" if self.authorize(amount) else "declined"
        return f"{self.name} {amount}: {status}"


class CardPayment(PaymentMethod):
    def __init__(self, last4: str, limit: Decimal) -> None:
        self.last4 = last4
        self._limit = limit

    @property
    def name(self) -> str:
        return f"card *{self.last4}"

    def authorize(self, amount: Decimal) -> bool:
        return amount <= self._limit


class GiftCard(PaymentMethod):
    def __init__(self, balance: Decimal) -> None:
        self._balance = balance

    @property
    def name(self) -> str:
        return "gift card"

    def authorize(self, amount: Decimal) -> bool:
        if amount > self._balance:
            return False
        self._balance -= amount
        return True


def checkout(total: Decimal, method: PaymentMethod) -> str:
    return method.pay(total)


def main() -> None:
    print(checkout(Decimal("40"), CardPayment("4242", limit=Decimal("100"))))
    gift = GiftCard(Decimal("50"))
    print(checkout(Decimal("30"), gift))
    print(checkout(Decimal("30"), gift))

    try:
        PaymentMethod()  # type: ignore[abstract]
    except TypeError:
        print("cannot instantiate the abstract class")

    class IncompletePayment(PaymentMethod):
        @property
        def name(self) -> str:
            return "incomplete"

    try:
        IncompletePayment()  # type: ignore[abstract]
    except TypeError:
        print("cannot instantiate a subclass missing authorize()")


if __name__ == "__main__":
    main()

# Expected output:
# card *4242 40: approved
# gift card 30: approved
# gift card 30: declined
# cannot instantiate the abstract class
# cannot instantiate a subclass missing authorize()
