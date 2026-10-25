from decimal import Decimal

import pytest

from .example import (
    POLICIES,
    BankTransferFee,
    CardFee,
    Checkout,
    FunctionCheckout,
    TieredWalletFee,
    checkout_for,
    main,
    promo_fee,
)


def test_card_fee_is_percent_plus_fixed_rounded_to_cents() -> None:
    assert CardFee().fee(Decimal("40.00")) == Decimal("1.46")
    assert CardFee().fee(Decimal("10.01")) == Decimal("0.59")


def test_bank_fee_is_flat() -> None:
    assert BankTransferFee().fee(Decimal("5")) == Decimal("0.50")
    assert BankTransferFee().fee(Decimal("5000")) == Decimal("0.50")


@pytest.mark.parametrize(
    ("amount", "fee"),
    [("19.99", "0.00"), ("20.00", "0.00"), ("20.01", "0.30"), ("100.00", "1.50")],
)
def test_wallet_fee_is_free_up_to_threshold(amount: str, fee: str) -> None:
    assert TieredWalletFee().fee(Decimal(amount)) == Decimal(fee)


def test_swapping_the_strategy_changes_the_total_without_changing_checkout() -> None:
    checkout = Checkout(CardFee())
    assert checkout.total(Decimal("40.00")) == Decimal("41.46")
    checkout.policy = BankTransferFee()
    assert checkout.total(Decimal("40.00")) == Decimal("40.50")


def test_any_object_with_a_fee_method_is_a_valid_strategy() -> None:
    class FixedTestFee:
        def fee(self, amount: Decimal) -> Decimal:
            return Decimal("9.99")

    assert Checkout(FixedTestFee()).total(Decimal("1.00")) == Decimal("10.99")


def test_checkout_for_looks_up_registered_policies() -> None:
    assert checkout_for("bank").policy is POLICIES["bank"]
    with pytest.raises(ValueError, match="crypto"):
        checkout_for("crypto")


def test_a_plain_function_works_as_a_strategy() -> None:
    assert FunctionCheckout(promo_fee).total(Decimal("12.345")) == Decimal("12.35")
    assert FunctionCheckout(lambda amount: Decimal("1")).total(Decimal("2")) == Decimal("3.00")


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
