from decimal import Decimal

import pytest

from .example import Employee, Intern, Manager, main


def test_base_pay_is_salary_over_twelve_rounded() -> None:
    assert Employee("a", Decimal("1000")).monthly_pay() == Decimal("83.33")


def test_manager_extends_parent_pay_and_keeps_parent_attributes() -> None:
    manager = Manager("m", Decimal("12000"), bonus=Decimal("50"))
    assert manager.monthly_pay() == Decimal("1050.00")
    assert manager.name == "m" and manager.salary == Decimal("12000")


def test_intern_replaces_pay() -> None:
    assert Intern("i", Decimal("999999")).monthly_pay() == Decimal("1200.00")


def test_inherited_describe_uses_the_override() -> None:
    assert Intern("i", Decimal("0")).describe() == "i: 1200.00"


def test_subclasses_are_substitutable() -> None:
    staff: list[Employee] = [Manager("m", Decimal("0"), Decimal("1")), Intern("i", Decimal("0"))]
    assert all(isinstance(person.monthly_pay(), Decimal) for person in staff)
    assert Manager.__mro__ == (Manager, Employee, object)


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
