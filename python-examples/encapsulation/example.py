"""Encapsulation: the account protects its balance rule; callers can only ask."""

from __future__ import annotations

from decimal import Decimal


class InsufficientFunds(ValueError):
    pass


class Account:
    def __init__(self, owner: str, overdraft_limit: Decimal = Decimal(0)) -> None:
        self.owner = owner  # public
        self._balance = Decimal(0)  # internal by convention
        self._limit = overdraft_limit
        self.__audit: list[str] = []  # name-mangled to _Account__audit

    @property
    def balance(self) -> Decimal:
        return self._balance

    @property
    def history(self) -> tuple[str, ...]:
        return tuple(self.__audit)

    def deposit(self, amount: Decimal) -> None:
        self._require_positive(amount)
        self._balance += amount
        self.__audit.append(f"+{amount}")

    def withdraw(self, amount: Decimal) -> None:
        self._require_positive(amount)
        if self._balance - amount < -self._limit:
            raise InsufficientFunds(f"cannot withdraw {amount}, balance {self._balance}")
        self._balance -= amount
        self.__audit.append(f"-{amount}")

    @staticmethod
    def _require_positive(amount: Decimal) -> None:
        if amount <= 0:
            raise ValueError("amount must be positive")


def main() -> None:
    account = Account("ana")
    account.deposit(Decimal("50"))
    account.withdraw(Decimal("20"))
    print(f"balance: {account.balance}")

    try:
        account.balance = Decimal("1000")  # type: ignore[misc]
    except AttributeError:
        print("balance is read-only")

    try:
        account.withdraw(Decimal("100"))
    except InsufficientFunds as exc:
        print(f"refused: {exc}")

    print(f"history: {account.history}")
    print(f"stored as _Account__audit: {'_Account__audit' in vars(account)}")


if __name__ == "__main__":
    main()

# Expected output:
# balance: 30
# balance is read-only
# refused: cannot withdraw 100, balance 30
# history: ('+50', '-20')
# stored as _Account__audit: True
