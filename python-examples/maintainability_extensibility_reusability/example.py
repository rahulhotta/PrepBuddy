"""Maintainable, extensible, reusable: exporters plug in without editing existing code."""

from __future__ import annotations

import csv
import io
import json
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class Line:
    item: str
    quantity: int
    unit_price: Decimal

    @property
    def amount(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass(frozen=True)
class Invoice:
    number: str
    lines: tuple[Line, ...] = field(default_factory=tuple)

    @property
    def total(self) -> Decimal:
        # One place for the rule: every exporter reuses it.
        return sum((line.amount for line in self.lines), Decimal(0))


class Exporter(Protocol):
    def export(self, invoice: Invoice) -> str: ...


class CsvExporter:
    def export(self, invoice: Invoice) -> str:
        out = io.StringIO()
        writer = csv.writer(out, lineterminator="\n")
        writer.writerow(["item", "quantity", "amount"])
        for line in invoice.lines:
            writer.writerow([line.item, line.quantity, line.amount])
        writer.writerow(["total", "", invoice.total])
        return out.getvalue()


class JsonExporter:
    def export(self, invoice: Invoice) -> str:
        return json.dumps({"number": invoice.number, "total": str(invoice.total)})


EXPORTERS: dict[str, Exporter] = {"csv": CsvExporter(), "json": JsonExporter()}


def export(invoice: Invoice, fmt: str) -> str:
    if fmt not in EXPORTERS:
        raise ValueError(f"unsupported format: {fmt}")
    return EXPORTERS[fmt].export(invoice)


def main() -> None:
    invoice = Invoice(
        "INV-7",
        (Line("keyboard", 2, Decimal("25.00")), Line("cable", 3, Decimal("4.50"))),
    )
    print(export(invoice, "json"))
    print(export(invoice, "csv"), end="")

    # Extension: a new format is a new class plus one registration; nothing above changes.
    class MarkdownExporter:
        def export(self, invoice: Invoice) -> str:
            return f"**{invoice.number}**: {invoice.total}"

    EXPORTERS["md"] = MarkdownExporter()
    print(export(invoice, "md"))


if __name__ == "__main__":
    main()

# Expected output:
# {"number": "INV-7", "total": "63.50"}
# item,quantity,amount
# keyboard,2,50.00
# cable,3,13.50
# total,,63.50
# **INV-7**: 63.50
