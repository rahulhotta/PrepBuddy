import pytest

from .example import Wallet, main


def test_instances_have_independent_state() -> None:
    a, b = Wallet("a"), Wallet("b")
    a.top_up(10)
    assert (a.balance, b.balance) == (10, 0)


def test_class_attribute_is_shared() -> None:
    assert Wallet("a").currency is Wallet("b").currency


def test_charge_refuses_overdraft_and_keeps_balance() -> None:
    w = Wallet("a", balance=5)
    assert not w.charge(6)
    assert w.balance == 5
    assert w.charge(5)
    assert w.balance == 0


def test_top_up_rejects_non_positive() -> None:
    with pytest.raises(ValueError):
        Wallet("a").top_up(0)


def test_equality_vs_identity_and_unhashable() -> None:
    a, b = Wallet("x", 1), Wallet("x", 1)
    assert a == b and a is not b
    assert a != Wallet("x", 2)
    with pytest.raises(TypeError):
        hash(a)


def test_repr_is_informative() -> None:
    assert repr(Wallet("z", 3)) == "Wallet(owner='z', balance=3)"


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
