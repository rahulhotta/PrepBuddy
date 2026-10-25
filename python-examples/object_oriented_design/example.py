"""Object-oriented design: a loan owns its dates and computes its own late fee."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal

DAILY_FEE = Decimal("0.25")
MAX_FEE = Decimal("5.00")
LOAN_DAYS = 14


@dataclass(frozen=True)
class Book:
    isbn: str
    title: str


@dataclass(frozen=True)
class Member:
    name: str
    limit: int = 3


@dataclass
class Loan:
    book: Book
    member: Member
    due: date
    returned: date | None = None

    def is_overdue(self, today: date) -> bool:
        return (self.returned or today) > self.due

    def late_fee(self, today: date) -> Decimal:
        end = self.returned or today
        days_late = max((end - self.due).days, 0)
        return min(DAILY_FEE * days_late, MAX_FEE)


class LimitReached(Exception):
    pass


@dataclass
class Library:
    loans: list[Loan] = field(default_factory=list)

    def active_loans(self, member: Member) -> list[Loan]:
        return [loan for loan in self.loans if loan.member == member and loan.returned is None]

    def borrow(self, member: Member, book: Book, today: date) -> Loan:
        if len(self.active_loans(member)) >= member.limit:
            raise LimitReached(f"{member.name} already has {member.limit} books")
        loan = Loan(book, member, due=today + timedelta(days=LOAN_DAYS))
        self.loans.append(loan)
        return loan

    def give_back(self, loan: Loan, today: date) -> Decimal:
        if loan.returned is not None:
            raise ValueError("loan already returned")
        loan.returned = today
        return loan.late_fee(today)


def main() -> None:
    library = Library()
    ana = Member("Ana", limit=1)
    book = Book("978-0000000001", "Practical Object Design")
    start = date(2026, 3, 1)

    loan = library.borrow(ana, book, start)
    print(f"due {loan.due}")
    try:
        library.borrow(ana, Book("978-0000000002", "Another"), start)
    except LimitReached as exc:
        print(f"refused: {exc}")

    print(f"overdue on day 20: {loan.is_overdue(start + timedelta(days=20))}")
    print(f"fee paid: {library.give_back(loan, start + timedelta(days=20))}")


if __name__ == "__main__":
    main()

# Expected output:
# due 2026-03-15
# refused: Ana already has 1 books
# overdue on day 20: True
# fee paid: 1.50
