from collections.abc import Iterator
from decimal import Decimal

import pytest

from .example import EXPORTERS, CsvExporter, Invoice, JsonExporter, Line, export, main


@pytest.fixture(autouse=True)
def restore_registry() -> Iterator[None]:
    saved = dict(EXPORTERS)
    yield
    EXPORTERS.clear()
    EXPORTERS.update(saved)


INVOICE = Invoice("X", (Line("a", 2, Decimal("1.25")), Line("b", 1, Decimal("3.00"))))


def test_total_is_computed_once_by_the_invoice() -> None:
    assert INVOICE.total == Decimal("5.50")
    assert Invoice("empty").total == Decimal(0)


def test_exporters_reuse_the_invoice_total() -> None:
    assert '"total": "5.50"' in JsonExporter().export(INVOICE)
    assert CsvExporter().export(INVOICE).splitlines()[-1] == "total,,5.50"


def test_new_format_needs_only_a_registration() -> None:
    class UpperExporter:
        def export(self, invoice: Invoice) -> str:
            return invoice.number.upper()

    EXPORTERS["upper"] = UpperExporter()
    assert export(Invoice("abc"), "upper") == "ABC"


def test_unknown_format_is_rejected() -> None:
    with pytest.raises(ValueError, match="pdf"):
        export(INVOICE, "pdf")


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
