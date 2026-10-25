from decimal import Decimal

import pytest

from .example import Account, InsufficientFunds, main


def test_balance_changes_only_through_methods() -> None:
    account = Account("a")
    account.deposit(Decimal("10"))
    account.withdraw(Decimal("4"))
    assert account.balance == Decimal("6")
    with pytest.raises(AttributeError):
        account.balance = Decimal("1")  # type: ignore[misc]


def test_overdraft_limit_is_respected() -> None:
    account = Account("a", overdraft_limit=Decimal("5"))
    account.withdraw(Decimal("5"))
    assert account.balance == Decimal("-5")
    with pytest.raises(InsufficientFunds):
        account.withdraw(Decimal("0.01"))


@pytest.mark.parametrize("amount", ["0", "-1"])
def test_non_positive_amounts_are_rejected(amount: str) -> None:
    with pytest.raises(ValueError):
        Account("a").deposit(Decimal(amount))


def test_history_is_a_read_only_copy() -> None:
    account = Account("a")
    account.deposit(Decimal("1"))
    history = account.history
    assert history == ("+1",)
    with pytest.raises(AttributeError):
        history.append("+999")  # type: ignore[attr-defined]
    assert account.history == ("+1",)


def test_name_mangling() -> None:
    account = Account("a")
    assert not hasattr(account, "__audit")
    assert hasattr(account, "_Account__audit")


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
