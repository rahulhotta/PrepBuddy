"""Classes and objects: one blueprint, many independent instances."""

from __future__ import annotations


class Wallet:
    currency = "EUR"  # class attribute: shared by every wallet

    def __init__(self, owner: str, balance: int = 0) -> None:
        self.owner = owner  # instance attributes: one copy per wallet
        self.balance = balance

    def top_up(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount

    def charge(self, amount: int) -> bool:
        if amount > self.balance:
            return False
        self.balance -= amount
        return True

    def __repr__(self) -> str:
        return f"Wallet(owner={self.owner!r}, balance={self.balance})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Wallet):
            return NotImplemented
        return (self.owner, self.balance) == (other.owner, other.balance)

    __hash__ = None  # mutable and value-equal: not safe as a dict key


def main() -> None:
    ana = Wallet("ana")
    ben = Wallet("ben", balance=5)

    ana.top_up(20)
    Wallet.top_up(ben, 5)  # same as ben.top_up(5)
    print(ana, ben)

    print(f"charge 30: {ana.charge(30)}, charge 15: {ana.charge(15)}")
    print(f"currency shared: {ana.currency} {ben.currency}")

    twin = Wallet("ana", balance=5)
    print(f"equal: {ana == twin}, same object: {ana is twin}")


if __name__ == "__main__":
    main()

# Expected output:
# Wallet(owner='ana', balance=20) Wallet(owner='ben', balance=10)
# charge 30: False, charge 15: True
# currency shared: EUR EUR
# equal: True, same object: False
