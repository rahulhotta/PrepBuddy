from decimal import Decimal

import pytest

from .example import CardPayment, GiftCard, PaymentMethod, checkout, main


def test_abstract_class_cannot_be_instantiated() -> None:
    with pytest.raises(TypeError):
        PaymentMethod()  # type: ignore[abstract]


def test_card_authorizes_up_to_limit() -> None:
    card = CardPayment("1111", limit=Decimal("10"))
    assert checkout(Decimal("10"), card) == "card *1111 10: approved"
    assert checkout(Decimal("10.01"), card).endswith("declined")


def test_gift_card_spends_balance() -> None:
    gift = GiftCard(Decimal("5"))
    assert gift.pay(Decimal("4")).endswith("approved")
    assert gift.pay(Decimal("2")).endswith("declined")
    assert gift.pay(Decimal("1")).endswith("approved")


def test_shared_workflow_validates_amount_for_every_subclass() -> None:
    for method in (CardPayment("1", Decimal("1")), GiftCard(Decimal("1"))):
        with pytest.raises(ValueError):
            method.pay(Decimal("0"))


def test_new_payment_types_work_without_changing_checkout() -> None:
    class AlwaysApprove(PaymentMethod):
        name = "test"  # type: ignore[assignment]

        def authorize(self, amount: Decimal) -> bool:
            return True

    assert checkout(Decimal("1"), AlwaysApprove()) == "test 1: approved"


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
