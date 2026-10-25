"""Instance, class and static methods on one small class."""

from __future__ import annotations

from typing import ClassVar, Self

ABSOLUTE_ZERO_C = -273.15


class Temperature:
    created: ClassVar[int] = 0

    def __init__(self, celsius: float) -> None:
        if not self.is_physical(celsius):
            raise ValueError(f"{celsius} C is below absolute zero")
        self.celsius = celsius
        Temperature.created += 1

    def to_fahrenheit(self) -> float:
        """Instance method: uses this object's state."""
        return self.celsius * 9 / 5 + 32

    @classmethod
    def from_fahrenheit(cls, fahrenheit: float) -> Self:
        """Class method: an alternative constructor that respects subclasses."""
        return cls((fahrenheit - 32) * 5 / 9)

    @staticmethod
    def is_physical(celsius: float) -> bool:
        """Static method: a rule that needs neither the object nor the class."""
        return celsius >= ABSOLUTE_ZERO_C


class LabTemperature(Temperature):
    pass


def main() -> None:
    room = Temperature(25)
    print(f"{room.celsius} C = {room.to_fahrenheit()} F")

    boiling = Temperature.from_fahrenheit(212)
    print(f"from F: {boiling.celsius} C")

    lab = LabTemperature.from_fahrenheit(32)
    print(f"subclass factory: {type(lab).__name__} {lab.celsius}")

    print(f"physical(-300): {Temperature.is_physical(-300)}")
    print(f"created: {Temperature.created}")


if __name__ == "__main__":
    main()

# Expected output:
# 25 C = 77.0 F
# from F: 100.0 C
# subclass factory: LabTemperature 0.0
# physical(-300): False
# created: 3
