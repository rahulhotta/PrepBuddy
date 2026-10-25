from datetime import date, timedelta
from decimal import Decimal

import pytest

from .example import Book, Library, LimitReached, Loan, Member, main

START = date(2026, 1, 10)
BOOK = Book("1", "B")


def test_loan_computes_its_own_fee_and_caps_it() -> None:
    loan = Loan(BOOK, Member("M"), due=START)
    assert loan.late_fee(START) == Decimal("0")
    assert loan.late_fee(START + timedelta(days=3)) == Decimal("0.75")
    assert loan.late_fee(START + timedelta(days=100)) == Decimal("5.00")


def test_returned_loan_fee_is_fixed_at_return_date() -> None:
    loan = Loan(BOOK, Member("M"), due=START, returned=START + timedelta(days=2))
    assert loan.late_fee(START + timedelta(days=50)) == Decimal("0.50")
    assert not Loan(BOOK, Member("M"), due=START, returned=START).is_overdue(START + timedelta(days=9))


def test_library_enforces_member_limit_and_frees_slot_on_return() -> None:
    library = Library()
    member = Member("M", limit=1)
    loan = library.borrow(member, BOOK, START)
    with pytest.raises(LimitReached):
        library.borrow(member, Book("2", "C"), START)
    library.give_back(loan, START)
    assert library.borrow(member, Book("2", "C"), START).member == member


def test_cannot_return_twice() -> None:
    library = Library()
    loan = library.borrow(Member("M"), BOOK, START)
    library.give_back(loan, START)
    with pytest.raises(ValueError):
        library.give_back(loan, START)


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
