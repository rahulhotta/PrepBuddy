from dataclasses import FrozenInstanceError
from decimal import Decimal

import pytest

from .example import ALLOWED, Money, Order, OrderStatus, main


def test_total_is_derived_from_lines() -> None:
    assert Order("x").total == Money(Decimal("0"))
    assert Order("x", [Money(Decimal("1.10")), Money(Decimal("2"))]).total == Money(Decimal("3.10"))


def test_every_status_has_a_transition_entry() -> None:
    assert set(ALLOWED) == set(OrderStatus)


@pytest.mark.parametrize(
    ("path", "ok"),
    [
        ([OrderStatus.PAID, OrderStatus.SHIPPED], True),
        ([OrderStatus.CANCELLED], True),
        ([OrderStatus.SHIPPED], False),
        ([OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.CANCELLED], False),
    ],
)
def test_status_setter_enforces_transitions(path: list[OrderStatus], ok: bool) -> None:
    order = Order("x")
    if ok:
        for status in path:
            order.status = status
        assert order.status is path[-1]
    else:
        with pytest.raises(ValueError):
            for status in path:
                order.status = status


def test_status_is_not_a_constructor_argument() -> None:
    with pytest.raises(TypeError):
        Order("x", [], OrderStatus.PAID)  # type: ignore[call-arg]


def test_money_is_an_immutable_hashable_value_object() -> None:
    money = Money(Decimal("1"))
    with pytest.raises(FrozenInstanceError):
        money.amount = Decimal("2")  # type: ignore[misc]
    assert {money, Money(Decimal("1.0"))} == {money}
    with pytest.raises(ValueError):
        Money(Decimal("-1"))
    with pytest.raises(ValueError):
        money + Money(Decimal("1"), "USD")


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
