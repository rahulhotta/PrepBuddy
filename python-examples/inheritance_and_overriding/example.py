"""Inheritance and overriding: extend with super(), or replace."""

from __future__ import annotations

from decimal import Decimal

CENT = Decimal("0.01")


class Employee:
    def __init__(self, name: str, salary: Decimal) -> None:
        self.name = name
        self.salary = salary

    def monthly_pay(self) -> Decimal:
        return (self.salary / 12).quantize(CENT)

    def describe(self) -> str:
        # Calls whichever monthly_pay() the actual object has.
        return f"{self.name}: {self.monthly_pay()}"


class Manager(Employee):
    def __init__(self, name: str, salary: Decimal, bonus: Decimal) -> None:
        super().__init__(name, salary)
        self.bonus = bonus

    def monthly_pay(self) -> Decimal:
        return super().monthly_pay() + self.bonus  # extend


class Intern(Employee):
    STIPEND = Decimal("1200.00")

    def monthly_pay(self) -> Decimal:
        return self.STIPEND  # replace


def main() -> None:
    staff: list[Employee] = [
        Employee("Ana", Decimal("60000")),
        Manager("Ben", Decimal("84000"), bonus=Decimal("500")),
        Intern("Cy", Decimal("0")),
    ]
    for person in staff:
        print(person.describe())

    print(f"manager is an employee: {isinstance(staff[1], Employee)}")
    print("MRO: " + " -> ".join(cls.__name__ for cls in Manager.__mro__))


if __name__ == "__main__":
    main()

# Expected output:
# Ana: 5000.00
# Ben: 7500.00
# Cy: 1200.00
# manager is an employee: True
# MRO: Manager -> Employee -> object
