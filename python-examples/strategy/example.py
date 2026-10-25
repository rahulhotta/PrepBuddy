"""Strategy: a checkout picks how to price the payment fee at runtime."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal
from typing import Protocol

CENT = Decimal("0.01")


def to_cents(value: Decimal) -> Decimal:
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


class FeePolicy(Protocol):
    """The strategy interface: one way to price a payment."""

    def fee(self, amount: Decimal) -> Decimal: ...


@dataclass(frozen=True)
class CardFee:
    percent: Decimal = Decimal("2.9")
    fixed: Decimal = Decimal("0.30")

    def fee(self, amount: Decimal) -> Decimal:
        return to_cents(amount * self.percent / 100 + self.fixed)


@dataclass(frozen=True)
class BankTransferFee:
    flat: Decimal = Decimal("0.50")

    def fee(self, amount: Decimal) -> Decimal:
        return to_cents(self.flat)


@dataclass(frozen=True)
class TieredWalletFee:
    """Free for small payments, then a percentage."""

    free_up_to: Decimal = Decimal("20.00")
    percent: Decimal = Decimal("1.5")

    def fee(self, amount: Decimal) -> Decimal:
        if amount <= self.free_up_to:
            return to_cents(Decimal(0))
        return to_cents(amount * self.percent / 100)


@dataclass
class Checkout:
    """The context: it uses a FeePolicy but never asks which one."""

    policy: FeePolicy

    def total(self, amount: Decimal) -> Decimal:
        return to_cents(amount + self.policy.fee(amount))


# Choosing a strategy is a lookup, not an if/elif chain.
POLICIES: dict[str, FeePolicy] = {
    "card": CardFee(),
    "bank": BankTransferFee(),
    "wallet": TieredWalletFee(),
}


def checkout_for(method: str) -> Checkout:
    try:
        return Checkout(POLICIES[method])
    except KeyError:
        raise ValueError(f"unknown payment method: {method!r}") from None


# Pythonic variant: a strategy with one method can simply be a function.
FeeFunction = Callable[[Decimal], Decimal]


def promo_fee(amount: Decimal) -> Decimal:
    return to_cents(Decimal(0))


@dataclass
class FunctionCheckout:
    fee: FeeFunction

    def total(self, amount: Decimal) -> Decimal:
        return to_cents(amount + self.fee(amount))


def main() -> None:
    amount = Decimal("40.00")
    for method in POLICIES:
        checkout = checkout_for(method)
        fee = checkout.policy.fee(amount)
        print(f"{method}: fee {fee}, total {checkout.total(amount)}")

    checkout = checkout_for("card")
    checkout.policy = TieredWalletFee(free_up_to=Decimal("50.00"))
    print(f"swapped at runtime: total {checkout.total(amount)}")

    promo = FunctionCheckout(fee=promo_fee)
    print(f"promo function: total {promo.total(amount)}")


if __name__ == "__main__":
    main()

# Expected output:
# card: fee 1.46, total 41.46
# bank: fee 0.50, total 40.50
# wallet: fee 0.60, total 40.60
# swapped at runtime: total 40.00
# promo function: total 40.00
